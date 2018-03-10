// (c) 2017 twitter.com/InstaCopV2 twitter.com/bqdxo


//Register adidas cart iFrame as Vue component (due to a Safari bug).
Vue.component('my-iframe', {
	template: '<iframe class="cart-frame" id="cart_frame" name="cart_frame"></iframe>'
});


//Vue.js instance.
window.app = new Vue({

	el: '#app',

	data: {

		config: Storage.fetchConfig(),

		tokens: Storage.fetchTokens(),

		pidImg: '',

		sitekey: {
			loading: false,
		},

		solver: {
			method: {
				tucap: true,
				acap: false
			},
			requests: 0,
			error: '',
			loading: false
		},

		hmac: {
			cookie: '',
			status: ''
		},

		cart: {
			items: 0,
			userCount: false,
			adding: false,
			text: '',
			newAPI: false
		},

		inventory: {
			status: '',
			locale: 'US',
			atc: {
				mode: 'Off',
				focus: false,
				size: ''
			},
			refresh: {
				mode: 'Off',
				sleep: 5
			},
			avail: {
				set: true,
				total: 'Avail.'
			},
			stock: {
				set: true,
				total: 'Stock'
			}
		}

	},

	computed: {

		//Share basic config as URL.
		instaLink() {
			let href = location.href + '?';
			for (let item in this.config) {
				if (item != 'locale') href += '&' + item + '=' + this.config[item];
			}
			return href;
		},

		//Check your host files and enter the correct URL.
		cookiesAccess() {
			return (document.domain.split('.www.adidas.')[1] == this.config.locale.domain);
		},

		//Localized link to the adidas Demandware API.
		adcBase() {
			let locale = this.config.locale;
			return 'https://www.adidas.' + locale.domain + '/on/demandware.store/Sites-adidas-' + locale.id + '-Site/' + locale.lang + '_' + locale.id + '/';
		},

		//Link to Yeezy splash page (may change on release day).
		splashLink() {
			return 'https://www.adidas.com/' + this.config.locale.id.toLowerCase() + '/apps/yeezy/';
		},

		//Direct link to product page.
		pidLink() {
			return this.adcBase + 'Product-Show?pid=%20' + this.config.style;
		},

	},

	watch: {

		config: {
			deep: true,
			handler: Storage.saveConfig
		},

		'config.style': function() { this.loadImg() }, 

		'config.locale': function() { this.checkHMAC() },

		'config.hmac': function() { this.checkHMAC() }

	},

	methods: {

		//Quick links to common ADC requests.
		adcLink(target) {

			let targets = {
				'show': 'Cart-Show',
				'checkout': 'COSummary-Start',
				'paypal': 'CODelivery-RedirectToPaypal',
				'login': 'MyAccount-Show',
				'logout': 'MyAccount-Logout'
			};

			return this.adcBase + (targets[target]);

		},

		//Manual ATC via input mask.
		atcManual() {

			let input = prompt('Enter size code for adding to cart:');

			if (input) this.addToCart(input);

		},

		//Fill and submit the HTML POST form, that sends the ATC request to the iFrame.
		async addToCart(size) {

			//Get captcha token.
			let token = this.getToken();

			if (!this.cart.newAPI) {

				//Add ClientID as reuqest parameter if specified.
				document.getElementById("post_form").action = this.adcBase + 'Cart-MiniAddProduct' + (this.config.clientID ? '?clientId=' + this.config.clientID : '');

				//Add POST parameters.
				document.getElementById("post_pid").value = this.config.style + '_' + size;
				document.getElementById("post_token").value = token;
				document.getElementById("post_mpid").value = this.config.style;

				document.getElementById("post_dup").name = this.config.captchaDup;
				document.getElementById("post_dup").value = token;

				//Submit request.
				document.getElementById("post_form").submit();

			} else {

				try {

					let res = await $.ajax({
						type: "POST",
						url: "https://www.adidas.de/api/cart_items",
						data: JSON.stringify({
							product_id: this.config.style,
							quantity: 1,
							product_variation_sku: this.config.style + '_' + size,
							size: "44",
							recipe: null,
							invalidFields: [],
							isValidating: false,
							clientCaptchaResponse: this.getToken()
						}),
						contentType: "application/json",
						dataType: "json"
					});

					document.getElementById("cart_frame").src = 'data:text/html,' + JSON.stringify(res.products.product_sku || []);
					console.log(res);
					
				} catch (err) {
					
					document.getElementById("cart_frame").src = 'data:text/html,' + JSON.stringify(err.responseJSON || err);
					console.log(err);

				}

			}


			//Update UI and check cart.
			this.cart.text = '... ' + this.config.style + '_' + size;
			this.cart.adding = true;
			setTimeout(this.updateCart, 1200);

		},

		//Check ADC cart cookies.
		updateCart() {

			this.cart.adding = false;
			//'user' is more accurate than 'persistent'. This difference is rendered in the UI.
			this.cart.userCount = Cookies.get('userBasketCount') ? true : false;
			this.cart.items = parseInt(Cookies.get('userBasketCount') || Cookies.get('persistentBasketCount') || 0);

		},

		//Reset iFrame.
		resetCart() {

			this.updateCart();
			document.getElementById("cart_frame").src = 'about:blank';

		},

		async loadImg() {

			let apiLink = 'https://www.adidas.' + this.config.locale.domain + '/api/products/' + this.config.style.trim();

			if (this.config.style.trim().length == 6) {

				try {
				
					let product = await $.getJSON(apiLink);
					this.pidImg = product.view_list[0].image_url + '?sw=200&sh=200&sm=fit';
					
				} catch (err) {

					this.pidImg = 'http://demandware.edgesuite.net/sits_pod20-adidas/dw/image/v2/aaqx_prd/on/demandware.static/-/Sites-adidas-products/en_US/dw1dddcb8f/zoom/' +  this.config.style.trim() + '_01_standard.jpg?sw=200&sh=200&sm=fit';
					
				}

			} else {
				
				this.pidImg = '';

			}

		},

		//Load inventory.
		loadInventory() {

			Inventory.load();

		},

		//Enable focus mode.
		setFocus() {

			this.inventory.atc.focus = !this.inventory.atc.focus;
			Inventory.reset();

		},

		//Set size for focus mode (size code table cell event hanlder).
		focusSize(size) {

			this.inventory.atc.focus = !this.inventory.atc.focus;
			this.inventory.atc.size = size;

			Inventory.build();

		},

		//Enable refresh mode.
		setSleep() {

			//Open input to edit refresh timeout on second click.
			if (this.inventory.refresh.mode == 'Timer') {

				let input = prompt('Enter inventory refresh cycle:', this.inventory.refresh.sleep);
				if (!isNaN(input) && input > 0 && input < 100) this.inventory.refresh.sleep = parseInt(input);

			} else {

				this.loadInventory();

			}

			this.inventory.refresh.mode = 'Timer';

		},

		//Edit sitekey and reload.
		editSitekey() {

			let input = prompt('Edit sitekey and reload:', this.config.sitekey);

			if (input !== null) {
				this.config.sitekey = input;
				location.reload();
			}

		},

		//Extract sitekey from product page HTML.
		async fetchSitekey() {

			this.sitekey.loading = true;

			try {

				let getHTML = await $.get(this.pidLink);

				let sitekey = $('.g-recaptcha', getHTML).data('sitekey');

				if (sitekey) {

					let input = prompt('Enter sitekey and reload:', sitekey);

					if (input !== null) {
						this.config.sitekey = input;
						location.reload();
					}

				}

			} catch (err) {}

			this.sitekey.loading = false;

		},

		//Check ADC HMAC cookie.
		checkHMAC() {

			Timers.hmac.stop();

			if (this.cookiesAccess) {

				this.hmac.cookie = this.config.hmac ? Cookies.get(this.config.hmac) : '';

				if (this.hmac.cookie) {

					try { //Parse expiration date from cookie.

						let expires = (this.hmac.cookie.split('=')[1].split('~')[0]) * 1000 + 1000;

						if (expires - Date.now() >= 0) {

							this.hmac.status = 'Valid';
							Timers.hmac.start(expires);

						} else {

							this.hmac.status = "Expired";

						}

					} catch (err) {

						this.hmac.status = "¯\\_(ツ)_/¯";

					}

				} else {

					this.hmac.status = "Not found";

				}

			} else {

				//Check your fucking host files.
				this.hmac.cookie = "";
				this.hmac.status = "No access to .www.adidas." + this.config.locale.domain;

			}

		},

		//Monitor for cookie change (continuousily), then trigger HMAC check.
		monitorHMAC() {

			if (this.cookiesAccess && this.hmac.cookie !== Cookies.get(this.config.hmac)) this.checkHMAC();

		},

		//Manually edit the HMAC cookie.
		editHMAC() {

			let input = prompt('Edit HMAC value:', Cookies.get(this.config.hmac));

			//Set cookie without js.cookie library due to speical char (~) in cookie.
			if (input !== null) document.cookie = this.config.hmac + '=' + input + '; domain=.www.adidas.' + this.config.locale.domain + '; path=/';

			//Remove cookie completely if empty.
			if (input === '') Cookies.remove(this.config.hmac, { domain: '.www.adidas.' + this.config.locale.domain });

			this.checkHMAC();

		},

		//Clear token array and set timer.
		initTokens() {

			while (this.tokens.length > 0 && Date.now() > this.tokens[0].expires) this.tokens.shift();

			if (this.tokens.length > 0) {

				Timers.token.start(this.tokens[0].expires);

			} else {

				Timers.token.stop();

			}

			//Sort by expriation.
			this.tokens.sort((a, b) => a.expires - b.expires);

			Storage.saveTokens(this.tokens);

		},

		//Push token to array.
		addToken(token, expires) {

			this.tokens.push({
				token: token,
				expires: expires
			});

			this.initTokens();

		},

		//Return oldest token.
		getToken() {

			this.initTokens();
			let token = this.tokens.length > 0 ? this.tokens.shift().token : '';
			this.initTokens();

			return token;

		},

		//Edit tokens via prompt.
		editTokens() {

			this.initTokens();

			let input = prompt('Edit token array:', JSON.stringify(this.tokens));

			if (input === '') {

				this.tokens = [];

			} else if (input !== null) {

				try {
					
					this.tokens = JSON.parse(input);

				} catch (err) {}

			}

			this.initTokens();

		},

		requestSolver() {

			if (this.solver.method.tucap) this.requestTucap();
			if (this.solver.method.acap) this.requestAcap();

		},

		//2Captcha API with error handling.
		async requestTucap() {

			this.solver.requests += 1;
			this.solver.loading = true;

			try {

				let getIn = await $.getJSON('http://2captcha.com/in.php', {
					key: this.config.tucap,
					method: 'userrecaptcha',
					googlekey: this.config.sitekey,
					pageurl: 'https://www.adidas.' + this.config.locale.domain,
					header_acao : 1,
					json: 1,
					soft_id: '1887'
				});

				this.solver.loading = false;

				if (getIn.status) {

					await wait(15000);

					let getRes = {};
					let resCount = 0;

					while (!getRes.status && (getRes.request == 'CAPCHA_NOT_READY' || resCount == 0) && resCount < 50) {

						await wait(5000);

						getRes = await $.getJSON('http://2captcha.com/res.php', {
							key: this.config.tucap,
							action: 'get',
							id: getIn.request,
							json: 1
						});

						resCount++;

					}

					if (getRes.status) {

						this.addToken(getRes.request, Date.now() + 110000); //2 minutes - 10 seconds.

					} else {

						this.solver.error = getRes.request;

					}

				} else {

					this.solver.error = getIn.request;

				}

			} catch (err) {

				this.solver.loading = false;
				this.solver.error = 'Error';

			}

			this.solver.requests += -1;
			await wait(2000);
			this.solver.error = '';

		},

		//2Captcha API with error handling.
		async requestAcap() {

			this.solver.requests += 1;
			this.solver.loading = true;

			try {
				
				let getIn = await $.post({
					url: 'https://api.anti-captcha.com/createTask',
					dataType: 'json',
					data: JSON.stringify({
						'clientKey': this.config.acap,
						'task': {
							'type': 'NoCaptchaTaskProxyless',
							'websiteURL': 'https:\/\/www.adidas.' + this.config.locale.domain,
							'websiteKey': this.config.sitekey
						},
						'softId': '852',
						'languagePool': 'en'
					})
				});

				this.solver.loading = false;

				if (!getIn.errorId) {

					await wait(15000);

					let getRes = {};
					let resCount = 0;

					while (!getRes.errorId && getRes.status !== 'ready' && resCount < 50) {

						await wait(5000);

						getRes = await $.post({
							url: 'https://api.anti-captcha.com/getTaskResult',
							dataType: 'json',
							data: JSON.stringify({
								clientKey: this.config.acap,
								taskId: getIn.taskId
							})
						});

						resCount++;

					}

					if (getRes.status == 'ready') {

						this.addToken(getRes.solution.gRecaptchaResponse, Date.now() + 110000); //2 minutes - 10 seconds.

					} else {

						this.solver.error = getRes.errorCode;

					}

				} else {

					this.solver.error = getIn.errorCode;

				}

			} catch (err) {

				this.solver.loading = false;
				this.solver.error = 'Error';

			}

			this.solver.requests += -1;
			await wait(2000);
			this.solver.error = '';

		},

		//Enable browser notifications and display confirmation.
		enableNotifications() {

			//Request browser notification permission.
			if (Notification.permission !== "granted") Notification.requestPermission();

			if (!Notification) {

				this.inventory.atc.mode = "Off";
				alert('Please update to a modern browser.');

			} else if (Notification.permission !== "granted") {

				this.stock.atc.mode = "Off";
				alert('Please allow InstaCop to send you notifications.');

			} else {

				new Notification('InstaCop V2', {
					icon: this.pidImg,
					body: 'Monitoring ' + this.config.style + '.'
				});

			}

		},

		//Send inventory number notification with picture and sound.
		notify(number) {

			if (Notification.permission == "granted") {

				let notification = new Notification('InstaCop V2', {
					icon: this.pidImg,
					body: this.config.style + ' stock: ' + number + ' available.'
				});

				notification.onclick = function() {
					this.inventory.atc.mode = "Auto";
				};

			}

			let audio = new Audio('instacop/alert.mp3');
			audio.play();

		},

	},

	mounted() {

		//Init timers with custom minutes2.js library.
		window.Timers = {};
		Timers.token = new Minutes2('token_timer', this.initTokens);
		Timers.hmac = new Minutes2('hmac_timer', this.checkHMAC);

		//Switch solver based on config.
		this.solver.method.tucap = this.config.tucap || !this.config.acap;
		this.solver.method.acap = !this.solver.method.tucap;

		//Initialize token array (retrieved from storage).
		this.initTokens();
		
		//Check HMAC and monitor continuousily.
		this.checkHMAC();
		window.setInterval(this.monitorHMAC, 2000);

		//Load product image.
		this.loadImg();

		//Check and reset cart.
		this.resetCart();

	}

});


//reCaptcha callback as specified in 'data-callback' tag.
function captchaCallback() {

	app.addToken(grecaptcha.getResponse(), Date.now() + 119500); //almost 2 minutes.

			
	setTimeout(function() {
		grecaptcha.reset();
	}, 800);

}


//async setTimeout.
function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


//Not set in Vue.mounted due to dependencies.
(function init() {

	Inventory.reset();
	
})();