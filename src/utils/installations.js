export const APP_URL = 'https://github.com/apps/comment-trigger/installations/new';
export const GRANT_URL = `https://github.com/settings/connections/applications/${process.env.REACT_APP_OAUTH_CLIENT_ID}`;
export const onNewInstallation = () => {
    window.location.href = APP_URL;
};
export const onGrantRepository = () => {
    window.open(GRANT_URL, '_blank');
};
