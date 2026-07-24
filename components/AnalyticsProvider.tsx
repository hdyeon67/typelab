"use client";

import Script from "next/script";
import { POSTHOG_KEY, POSTHOG_HOST, CF_BEACON_TOKEN } from "@/lib/config/flags";

// 계측 로더 — 키/토큰이 있을 때만 스크립트를 주입한다(운영비 0원·쿠키리스).
//   PostHog: memory persistence(쿠키 없음), 자동수집·세션리코딩 off, 페이지뷰는
//            직접 이벤트로 관리. 개인정보는 절대 전송하지 않음.
//   Cloudflare Web Analytics: 트래픽 베이스라인(보조).
//   ※ IP 미저장은 PostHog 프로젝트 설정(Discard client IP)에서 함께 켤 것.
export function AnalyticsProvider() {
  return (
    <>
      {POSTHOG_KEY && (
        <Script id="posthog-init" strategy="afterInteractive">
          {`
          !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording capture_pageview".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
          posthog.init('${POSTHOG_KEY}', {
            api_host: '${POSTHOG_HOST}',
            persistence: 'memory',
            autocapture: false,
            capture_pageview: false,
            disable_session_recording: true
          });
          `}
        </Script>
      )}
      {CF_BEACON_TOKEN && (
        <Script
          id="cf-beacon"
          strategy="afterInteractive"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN })}
        />
      )}
    </>
  );
}
