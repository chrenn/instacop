// (c) 2017 twitter.com/InstaCopV2 twitter.com/bqdxo


//Inventory checking URLs.
window.URLs = {

	//Use a CORS PHP proxy in case adidas disables cross-origin and JSONP requests.
	proxy: '', //'instacop/proxy.php?csurl=',

	//Demandware setup.
	dwStore() {
		switch (app.config.locale.id) {
			case 'US': case 'CA': case 'MX':
				return '-us-'; break;
			default:
				return '-store-';
		}
	},

	//Version v16_9 fetches both pairs ready to cart ('Avail.') and current stock incl. cart holds ('Stock'). Needs a valid ClientID.
	dwClient(sizes) {
		return app.inventory.avail.set ? 'https://www.adidas.' + app.config.locale.domain + '/s/adidas-' + app.config.locale.id + '/dw/shop/v17_6/products/(' + sizes + ')?client_id=' + app.config.clientID + '&expand=variations,availability&callback=?' : '';
	},

	//Fallback using the new ADC API.
	apiAvail(pid) {
		return app.inventory.stock.set ? 'https://www.adidas.' + app.config.locale.domain + '/api/products/' + pid  + '/availability' : '';
	},

	//Fetches sizes and stock availability (not those ready to cart anymore...).
	getAvail(pid) {
		return this.proxy + app.adcBase + 'Product-GetAvailableSizes?pid=' + pid;
	},

	//Crawls stock numbers from the HTML size picker. Only displays available sizes.
	getHTML(pid) {
		return this.proxy + app.adcBase + 'Product-Show?pid=' + pid;
	},

	//Fetches stock numbers (not in real time, but sometimes available before product is loaded on other methods).
	getVariant(pid) {
		return this.proxy + app.adcBase + 'Product-GetVariants?pid=' + pid;
	}


};


//Stock checking.
window.Inventory = {

	main: {
		locale: '',
		style: '',
		inv: [],
	},

	cache: {
		locale: '',
		style: '',
		inv: [],
	},

	init: {
		locale: 'US',
		style: '',
		inv: [
			{code:'530', size:'4',   avail:'?', stock:'?'},
			{code:'540', size:'4.5', avail:'?', stock:'?'},
			{code:'550', size:'5',   avail:'?', stock:'?'},
			{code:'560', size:'5.5', avail:'?', stock:'?'},
			{code:'570', size:'6',   avail:'?', stock:'?'},
			{code:'580', size:'6.5', avail:'?', stock:'?'},
			{code:'590', size:'7',   avail:'?', stock:'?'},
			{code:'600', size:'7.5', avail:'?', stock:'?'},
			{code:'610', size:'8',   avail:'?', stock:'?'},
			{code:'620', size:'8.5', avail:'?', stock:'?'},
			{code:'630', size:'9',   avail:'?', stock:'?'},
			{code:'640', size:'9.5', avail:'?', stock:'?'},
			{code:'650', size:'10',  avail:'?', stock:'?'},
			{code:'660', size:'10.5',avail:'?', stock:'?'},
			{code:'670', size:'11',  avail:'?', stock:'?'},
			{code:'680', size:'11.5',avail:'?', stock:'?'},
			{code:'690', size:'12',  avail:'?', stock:'?'},
			{code:'700', size:'12.5',avail:'?', stock:'?'},
			{code:'710', size:'13',  avail:'?', stock:'?'},
			{code:'720', size:'13.5',avail:'?', stock:'?'},
			{code:'730', size:'14',  avail:'?', stock:'?'}
		],
	},

	//Add or update sizes.
	update(data) {

		//Check if size exists in array.
		let index = this.main.inv.findIndex(item => item.code == data.code);

		if (index != -1) {

			//Only updates the properties specified in the data parameter.
			this.main.inv[index].size = (data.size !== undefined) ? data.size : (this.main.inv[index].size || data.code);
			this.main.inv[index].avail = (data.avail !== undefined) ? data.avail : (this.main.inv[index].avail || '?');
			this.main.inv[index].stock = (data.stock !== undefined) ? data.stock : (this.main.inv[index].stock || '?');

		} else {
			
			//Push new object to array.
			this.main.inv.push( {
				code: data.code,
				size: (data.size !== undefined) ? data.size : data.code,
				avail: (data.avail !== undefined) ? data.avail : '?',
				stock: (data.stock !== undefined) ? data.stock : '?',
			});

		}

		//Sort array (precautionairy).
		this.main.inv.sort((a, b) => parseInt(a.code) - parseInt(b.code));

	},

	//Transform object for json2html.js library. Format inventory array to HTML table.
	transform:
	{"tag":"table", "children":[
		{"tag":"tbody", "children":[
			{"tag":"tr", "id":"${code}", "children":[
				{"tag":"td", "children":[
					{"tag":"span", "class":"table-code is-bold has-pointer black", "html":"${code}"}
				]},
				{"tag":"td", "html":"${size}"},
				{"tag":"td", "class":function() {return (this.avail > 0 ? 'red ' : '') + 'has-text-right is-bold'}, "html":"${avail}"},
				{"tag":"td", "class":function() {return (this.stock > 0 ? 'red ' : '') + 'has-text-right is-bold'}, "html":"${stock}"},
				{"tag":"td", "class":function() {return (this.change > 0 ? 'red ' : '') + 'has-text-right'}, "html":"${change}"},
				{"tag":"td", "class":"has-text-right", "children":[
					{"tag":"span", "class":"table-add is-bold has-pointer black", "html":"Add"}
				]}
			]}
		]}
	]},

	//Prepare inventory array and transform to HTML.
	build() {

		let inv = this.main.inv;

		//Focus mode: Only accept the specified size.
		if (app.inventory.atc.focus) {
			inv = inv.filter(item => item.code == app.inventory.atc.size);
		}

		//Calculate stock change.
		if (this.main.style == this.cache.style) {

			inv.forEach((stockItem, stockIndex) => {

				try {

					let cacheIndex = this.cache.inv.findIndex(cacheItem => cacheItem.code == stockItem.code);

					if (cacheIndex != -1) {

						let change = stockItem.stock - this.cache.inv[cacheIndex].stock;
						stockItem.change = !isNaN(change) ? (change > 0 ? '+' : '') + change : '';

					}

				} catch (err) {}

			});

		}

		//Set inventory locale.
		app.inventory.locale = this.main.locale;

		//Transform inventory to HTML.
		$('#inv_body').html(json2html.transform(inv, this.transform));

		//Add ATC function to click event lister.
		$('.table-add').click(function() {
			app.addToCart(this.parentNode.parentNode.id);
		});

		$('.table-code').click(function() {
			app.focusSize(this.parentNode.parentNode.id);
		});

		if (app.inventory.atc.focus) {
			$('.table-code').addClass('red');
		}

		//Adjust cart iFrame height.
		$('#cart_frame').css('height', $('#inv_table').css('height'));

	},

	//Reset the size chart.
	reset() {

		//Clone init object. Immutability!
		//this.main = {...this.init};
		this.main = Object.assign({}, this.init); 
		this.build();

	},

	//Fetch inventory numbers with promises/async.
	async load() {

		//Intitialize.
		app.inventory.status = '...';
		app.inventory.avail.total = 'Avail.';
		app.inventory.stock.total = 'Stock';

		this.cache = Object.assign({}, this.main); //Clone.
		this.main.inv = [];

		this.main.locale = app.config.locale.id;
		this.main.style = app.config.style;

		let client = { success: false, total: 0, ats: 0 };
		let api = { success: false, total: 0 };
		let html = { success: false, total: 0 };
		let avail = { success: false, total: 0 };
		let variant = { success: false, total: 0 };

		let self = this;

		//Wait for all promises in this block to resolve.
		await async function() {

			try { //Best option: Demandware/ClientID.

				let sizes = [];

				//1st request: PID.
				let dwMaster = await $.getJSON(URLs.dwClient(self.main.style));

				app.inventory.stock.total = client.total = dwMaster.data[0].inventory.stock_level;

				//Create sizes array for second request.
				dwMaster.data[0].variation_attributes[0].values.forEach(item => {

					self.update({
						code: item.value,
						size: item.name,
					});

					sizes.push(app.config.style + '_' + item.value);

				});

				client.success = Boolean(sizes.length);

				if (client.success) {

					if (app.inventory.atc.mode == "Monitor" && client.total) app.notify(client.total);

					//2nd request: Sizes. (1,2,3,...)
					let dwSizes = await $.getJSON(URLs.dwClient(sizes.join(',')));

					//Update inventory array.
					dwSizes.data.forEach(item => {

						self.update({
							code: item.c_size,
							avail: item.inventory.ats, //Ready to cart.
							stock: item.inventory.stock_level, //Stock.
						});	

						client.ats += item.inventory.ats;

					});

					app.inventory.avail.total = client.ats;

					//Auto ATC.
					if (app.inventory.atc.mode.includes('Auto')) {

						if (app.inventory.atc.focus) {

							//Focus mode.
							let index = self.main.inv.findIndex(item => item.code == app.inventory.atc.size && item.avail);
							if (index != -1) app.addToCart(self.main.inv[index].code);

						} else {

							if (app.inventory.atc.mode == "AutoX") {

								let max = 0; let maxCode = '';
								self.main.inv.forEach(item => {
									if ((parseInt(item.code) <= 560 || parseInt(item.code) >= 670) && item.avail > max && item.avail <= 5) {
										max = item.avail; maxCode = item.code
									}
								});
								if (max) app.addToCart(maxCode);

							} else {

								//Get size with highest available pairs. Prioritize larger sizes.
								let max = 0; let maxCode = '';
								self.main.inv.forEach(item => { if (item.avail >= max) { max = item.avail; maxCode = item.code } });
								if (max) app.addToCart(maxCode);

							}

						}

					}

					app.inventory.status = 'Client';
					self.build();

				} else throw new Error(); //Go to catch.

			} catch (err) {

				try { //1st fallback: new ADC API.

					let apiAvail = await $.getJSON(URLs.apiAvail(self.main.style));

					apiAvail.variation_list.forEach(item => {

						self.update({
							code: item.sku.split('_')[1],
							size: item.size,
							stock: item.availability
						});

						api.success = true;
						api.total += item.availability;

					});

					if (api.success) {

						app.inventory.status = 'API';
						app.inventory.stock.total = api.total;

						if (app.inventory.atc.mode == "Monitor" && app.inventory.stock.total) app.notify(app.inventory.stock.total);

						self.build();

					} else throw new Error();
					
				} catch (err) {

					try { //2nd fallback: getAvailSizes + scrape HTML.

						//Start both requests simultaneously. Catch getAvail in case of 403.
						let _getAvail = $.getJSON(URLs.getAvail(self.main.style)).catch(err => Promise.resolve({ sizes: [] }));
						let _getHTML = $.get(URLs.getHTML(self.main.style));

						//Await both promises.
						let getAvail = await _getAvail;
						let getHTML = await _getHTML;

						//Create sizes and 0/1 availability from getAvail.
						getAvail.sizes.forEach(item => {

							let inStock = item.status == 'IN_STOCK' ? 1 : 0;

							self.update({
								code: item.sku.split('_')[1],
								size: item.literalSize,
								stock: inStock,
							});

							avail.success = true;
							avail.total += inStock;

						});

						//Parse HTML to size picker stock numbers array and update inventory array.
						[...$('.size-select', getHTML).children()].forEach(item => {

							if (item.value != 'empty') {
								try {

									let stock = item.dataset.maxavailable == 'null' ? 0 : parseInt(item.dataset.maxavailable);

									self.update({
										code: item.value.split('_')[1],
										size: item.innerHTML.trim(),
										stock: stock,
									});

									html.success = true;
									html.total += stock;

								} catch (err) { }
							}

						});

						if (html.success || avail.success) {

							app.inventory.status = html.success ? 'HTML' : 'Sizes';
							app.inventory.stock.total = html.total || avail.total;

							if (app.inventory.atc.mode == "Monitor" && app.inventory.stock.total) app.notify(app.inventory.stock.total);

							self.build();

						} else throw new Error();

					} catch (err) {

						try { //3rd fallback: getVariant.

							let getVariant = await $.getJSON(URLs.getVariant(self.main.style));

							//Update inventory array.
							getVariant.variations.variants.forEach(item => {

								self.update({
									code: item.id.split('_')[1],
									size: item.attributes.size,
									stock: item.ATS,
								});

								variant.success = true;
								variant.total += item.ATS;

							});

							if (variant.success) {

								app.inventory.status = 'Variant';
								app.inventory.stock.total = variant.total;

								if (app.inventory.atc.mode == "Monitor" && variant.total) app.notify(variant.total);

								self.build();

							} else throw new Error();

						} catch (err) {

							//Reset inventory.
							app.inventory.status = "¯\\_(ツ)_/¯";
							self.reset();

						}

					}

				}

			}

		}();

		//Auto Refresh.
		if (app.inventory.refresh.mode == 'Timer') {

			//Randomize sleep duration +-25%.
			let sleep = app.inventory.refresh.sleep * 1000 * (Math.random() * 0.5 + 0.75);

			setTimeout(function() {
				if (app.inventory.refresh.mode == 'Timer') self.load();
			}, sleep);

		}

	}

};