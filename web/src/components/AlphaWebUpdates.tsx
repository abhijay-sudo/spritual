import { useRegisterSW } from "virtual:pwa-register/react";

/** Register the web alpha for offline reading without refreshing an unfinished note. */
export function AlphaWebUpdates() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="connection-banner" role="status">
      An update is ready. Save any unfinished note before refreshing. / अपडेट तैयार है। रीफ़्रेश से पहले अधूरा विचार सहेजें।{" "}
      <button className="text-button" type="button" onClick={() => void updateServiceWorker(true)}>
        Refresh app / ऐप रीफ़्रेश करें
      </button>
    </div>
  );
}
