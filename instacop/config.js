// (c) 2017 twitter.com/InstaCopV2 twitter.com/bqdxo //

(function (exports) {

	function getUrlParam(key){
		let result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search); 
		return result && unescape(result[1]) || ""; 
	}

	const INIT = {

		locale: { id: 'DE', domain: 'de', lang: 'de' },
		style: 'CP9654',
		sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
		tucap: 'ada1352164081dd9cbd9bcf9274167b5',
		captchaDup: 'x-PrdRt',
		clientID: 'c1f3632f-6d3a-43f4-9987-9de920731dcb',
		hmac: 'gceeqs',
		pw: ''

	};

	const STORAGE_KEY = 'instacop-config';

	exports.InstaConfig = {

		fetch: function () {

			let config = {};
			let store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

			Object.keys(INIT).forEach( item => {
				config[item] = getUrlParam(item) || store[item] || INIT[item];
			});

			return config
		},

		save: function (config) {

			localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

		}

	};

})(window);