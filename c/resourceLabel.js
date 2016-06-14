var ResourceLabel= Object.create(HTMLElement.prototype, {
	refresh: {
		enumerable: true,
		value: function(){
			var src= this.getAttribute("src")
			return fetch(this.getAttribute("src")).then(function(response){
				this.data= response.text().then(function(data){
					try{
						data= JSON.parse(data)
					}catch(ex){}
					this.innerHTML = JSON.stringify(data)
					return data
				})
			})
		}
	},
	attributeChangedCallback: {
		value: function(name, oldValue, newValue){
			console.assert(name === "src")
			this.refresh()
		}
	},
	connectedCallback: {
		value: function(){
			this.innerHTML= "[loading]"
		}
	},
	createdCallback: {
		value: function(){
			var src= this.getAttribute("src")
			if(src){
				this.attributeChangedCallback("src", undefined, src)
			}
			this.innerHTML= "[loading]"
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

if(typeof customElements !== "undefined"){
	customElements.define("resource-label", ResourceLabel, {extends: "span"})
}else{
	document.registerElement("resource-label", {
		prototype: ResourceLabel
	})
}
