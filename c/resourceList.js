var ResourceList= Object.create(HTMLElement.prototype, {
	refresh: {
		enumerable: true,
		value: function(){
			return fetch(this.getAttribute("src")).then(function(response){
				this.data= response.text().then(function(data){
					try{
						data= JSON.parse(data)
						var html = ["<ol>"]
						data.forEach(function(item){
							html.push("<li>", item.toString(), "</li>")
						})
						html.push("</ol>")
						this.innerHTML= html.join("")
					}catch(ex){
						data= null
						return
					}
				})
			})
		}
	},
	attributeChangedCallback: {
		writable: true,
		value: function(name, oldValue, newValue){
			if(name === "src"){
				this.refresh()
			}else{
				console.error("unexpected attribute changed event: "+name)
			}
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

Object.defineProperties(ResourceList, {
	observedAttributes: {
		enumerable: true,
		get: function(){
			return ["src"]
		}
	}
})

if(typeof customElements !== "undefined"){
	customElements.define("resource-list", ResourceList, {extends: "span"})
}else{
	document.registerElement("resource-list", {
		prototype: ResourceList
	})
}
