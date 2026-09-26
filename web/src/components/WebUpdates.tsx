import { useRegisterSW } from "virtual:pwa-register/react";
import { useApp } from "../context";

export function WebUpdates({ hasDraft }: { hasDraft: boolean }) {
  const { t } = useApp();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <div className="connection-banner" role="status">
      {t(
        "An update is ready. Save any reflection before refreshing.",
        "अपडेट तैयार है। रीफ़्रेश करने से पहले अपना विचार सहेजें।",
      )}{" "}
      <button
        className="text-button"
        disabled={hasDraft}
        onClick={() => updateServiceWorker(true)}
      >
        {t("Refresh app", "ऐप रीफ़्रेश करें")}
      </button>
    </div>
  );
}
