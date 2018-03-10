// (c) 2017 twitter.com/InstaCopV2 twitter.com/bqdxo //

(function (exports) {

	function getUrlParam(key){
		let url = new URL(location.href);
		return url.searchParams.get(key);
	}

	const INIT = {

		locale: { id: 'DE', domain: 'de', lang: 'de' },
		style: 'CP9654',
		sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
		tucap: '',
		acap: '',
		captchaDup: 'x-PrdRt',
		clientID: '',
		hmac: 'gceeqs',

	};

	const CONFIG_KEY = 'instacop-config';
	const TOKENS_KEY = 'instacop-tokens';

	exports.Storage = {

		fetchConfig() {

			let config = {};
			let store = JSON.parse(localStorage.getItem(CONFIG_KEY) || '[]');

			Object.keys(INIT).forEach( item => {
				config[item] = getUrlParam(item) || store[item] || INIT[item];
			});

			this.saveConfig(config);

			//Strip all URL parameters.
			history.replaceState({}, "", location.pathname);

			return config
		},

		saveConfig(config) {

			try { //Safari private mode.

				localStorage.setItem(CONFIG_KEY, JSON.stringify(config));

			} catch (err) {}

		},

		fetchTokens() {

			return JSON.parse(localStorage.getItem(TOKENS_KEY) || '[]');

		},

		saveTokens(tokens) {

			try {

				localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));

			} catch (err) {}

		}

	};

})(window);