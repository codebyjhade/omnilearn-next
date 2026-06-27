const isNode = typeof window === 'undefined';
const storage = isNode
  ? {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
  : window.localStorage;

/**
 * @param {string} str
 * @returns {string}
 */
const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * @param {string} paramName
 * @param {{ defaultValue?: string, removeFromUrl?: boolean }} [options]
 * @returns {string | null}
 */
/**
 * @param {string} paramName
 * @param {{ defaultValue?: string, removeFromUrl?: boolean }} [options]
 * @returns {string | null}
 */
const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue ?? null;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue != null) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	return {
		appId: getAppParamValue("app_id", { defaultValue: process.env.NEXT_PUBLIC_BASE44_APP_ID }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: typeof window !== 'undefined' ? window.location.href : '' }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: process.env.NEXT_PUBLIC_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: process.env.NEXT_PUBLIC_BASE44_APP_BASE_URL }),
	}
}


export const appParams = {
	...getAppParams()
}
