// (c) 2017 twitter.com/InstaCopV2 twitter.com/bqdxo //

(function (exports) {

	function Minutes2(selector, onEnd) {

		this.deadline = 0;
		this.running = false;
		this.selector = selector;
		this.onEnd = onEnd || function(){};

	}

	Minutes2.prototype = {

		print: function(remaining) {

			let m = ((remaining / 1000) / 60) | 0;
			let s = ((remaining / 1000) % 60) | 0;

			m = m > 0 ? m + 'm' : '';
			s = (s < 10 ? '0' : '') + s + 's';

			document.getElementById(this.selector).innerHTML = m + ' ' + s;;

		},

		start: function(deadline) {

			this.running = true;
			this.deadline = deadline;

			let remaining;
			let self = this;

			(function timer() {

				remaining = self.deadline - Date.now();

				if (self.running && remaining >= 0) {

					self.print(remaining);
					setTimeout(timer, 1000);

				} else {

					self.stop();
				
				}

			})();

		},

		pause: function() {

			this.running = false;

		},

		resume: function() {

			this.running = true;
			this.start(this.deadline);

		},

		stop: function() {

			if (this.running) {
				this.running = false;
				this.print(0);
				this.onEnd();
			}

		}

	};

	exports.Minutes2 = Minutes2;

})(window);