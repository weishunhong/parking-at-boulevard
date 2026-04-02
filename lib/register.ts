import { REGISTRATION_DURATION_HOURS } from "./env";
import {
  buildPostJsonBody,
  postParkingRegistration,
  resolveParkingPostUrl,
} from "./parking-post";
import {
  getParkingFormEnv,
  missingRecommendedParkingFormEnv,
  missingRequiredPermitUrlEnv,
  parkingEnvSummaryForLogs,
} from "./parking-env";

export type RegisterResult = {
  success: boolean;
  message: string;
  durationHours: number;
  metadata?: Record<string, unknown>;
};

/**
 * Permit page GET + optional JSON POST to PropertyBoss-style API.
 * Configure `PARKING_POST_URL` or `PARKING_POST_RELATIVE_PATH` from browser HAR.
 *
 * `SKIP_PARKING_REGISTRATION=true` — record a dry-run success without calling the network.
 */
export async function registerViaAutomation(): Promise<RegisterResult> {
  const durationHours = REGISTRATION_DURATION_HOURS;

  if (process.env.SKIP_PARKING_REGISTRATION === "true") {
    return {
      success: true,
      message: "Dry run (SKIP_PARKING_REGISTRATION=true)",
      durationHours,
      metadata: { skipped: true },
    };
  }

  const urlMissing = missingRequiredPermitUrlEnv();
  if (urlMissing.length > 0) {
    return {
      success: false,
      message: `Missing: ${urlMissing.join(", ")} (from permit URL path and query).`,
      durationHours,
      metadata: { missing: urlMissing },
    };
  }

  const form = getParkingFormEnv();
  const formMissing = missingRecommendedParkingFormEnv();
  if (
    formMissing.length > 0 &&
    process.env.PARKING_REQUIRE_FULL_FORM !== "false"
  ) {
    return {
      success: false,
      message: `Set in .env.local: ${formMissing.join(", ")}. (Or set PARKING_REQUIRE_FULL_FORM=false while testing.)`,
      durationHours,
      metadata: {
        missing: formMissing,
        configured: parkingEnvSummaryForLogs(form),
      },
    };
  }

  const permitUrl = new URL(
    `${form.baseUrl}/${form.tenantSlug}/permits/new`,
  );
  permitUrl.searchParams.set("policy", form.policyId);
  permitUrl.searchParams.set("media", form.mediaQueryId);

  try {
    return await submitPermitFlow(permitUrl.toString(), durationHours, form);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      success: false,
      message: message.slice(0, 2000),
      durationHours,
    };
  }
}

function parseApiErrorHint(bodyText: string): string {
  const slice = bodyText.slice(0, 800);
  try {
    const j = JSON.parse(bodyText) as {
      message?: string;
      error?: string;
      errors?: unknown;
    };
    if (typeof j.message === "string") return j.message;
    if (typeof j.error === "string") return j.error;
    if (j.errors != null) return JSON.stringify(j.errors).slice(0, 400);
  } catch {
    /* ignore */
  }
  return slice;
}

async function submitPermitFlow(
  pageUrl: string,
  durationHours: number,
  form: ReturnType<typeof getParkingFormEnv>,
): Promise<RegisterResult> {
  const cookie = form.cookie ?? "";
  const skipGet = process.env.PARKING_SKIP_PAGE_GET === "true";

  if (!skipGet) {
    const res = await fetch(pageUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        "User-Agent": "parking-at-boulevard/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      return {
        success: false,
        message: `HTTP ${res.status} loading permit page`,
        durationHours,
        metadata: {
          pageUrl: pageUrl.slice(0, 500),
          apiBase: form.apiBaseUrl,
          lifetimeIso: form.lifetimeIso,
          configured: parkingEnvSummaryForLogs(form),
        },
      };
    }
  }

  const postUrl = resolveParkingPostUrl(form);
  if (!postUrl) {
    return {
      success: false,
      message:
        "Permit page OK (or skipped). Add PARKING_POST_URL (full URL from HAR) or PARKING_POST_RELATIVE_PATH (path after tenant on api.propertyboss.io), then retry.",
      durationHours,
      metadata: {
        hint: "Open DevTools → Network → copy the successful POST request URL. Set PARKING_POST_URL to that exact URL, or set PARKING_POST_RELATIVE_PATH to the path segment after your tenant id.",
        apiBase: form.apiBaseUrl,
        tenant: form.tenantSlug,
        configured: parkingEnvSummaryForLogs(form),
        skipPageGet: skipGet,
      },
    };
  }

  try {
    buildPostJsonBody(form);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      success: false,
      message,
      durationHours,
      metadata: { postUrl: postUrl.slice(0, 300) },
    };
  }

  const post = await postParkingRegistration(form);

  if (!post.ok) {
    return {
      success: false,
      message: `Registration API HTTP ${post.status}: ${parseApiErrorHint(post.bodyText)}`,
      durationHours,
      metadata: {
        postUrl: postUrl.slice(0, 400),
        status: post.status,
      },
    };
  }

  return {
    success: true,
    message: `Registration API HTTP ${post.status} OK`,
    durationHours,
    metadata: {
      postUrl: postUrl.slice(0, 400),
      responsePreview: post.bodyText.slice(0, 500),
    },
  };
}
