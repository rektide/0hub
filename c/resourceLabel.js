var ResouceLabel= Object.create(HTMLElement.prototype, {
	refresh: {
		enumerable: true,
		value: function(){
			return fetch(this.getAttribute("src")).then(function(response){
				this.data= response.text().then(function(data){
					try{
						return JSON.parse(data)
					}catch(ex){
						return data
					}
				})
			})
		}
	},
	attributeChangedCallback: {
		value: function(name, oldValue, newValue){
			console.assert(name === "src")
			this.refresh()
		}
	}
})

Object.defineProperties(ResourceLabel, {
	observedAttributes: {
		enumerable: true,
		get: function(){
			return ["src"]
		}
	}
})

customElements.define("resource-label", ResourceLabel, {extends: "span"})
