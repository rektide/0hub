class ResourceLabel extends HTMLElement {
	constructor(){
		super()
	}
	static get observedAttributes(){
		return ["src"]
	}
	connectedCallback(){
		var src= this.getAttribute("src")
		if(src){
			this.refresh()
		}
		this.innerHTML = "[loading]"
	}
	refresh(){
		this.data= fetch(this.getAttribute("src"))
		  .then(response=> response.json())
		this.data.then(data=> {
			this.innerHTML= data
		})
	}
	attributedChangedCallback(name){
		if(name === "src"){
			this.refresh()
		}else{
			console.error("unexpected attribute changed event: "+name)
		}
	}
}

//	refresh: {
//		enumerable: true,
//		value: function(){
//			var src= this.getAttribute("src")
//			return fetch(this.getAttribute("src")).then(function(response){
//				this.data= response.text().then(function(data){
//					try{
//						data= JSON.parse(data)
//					}catch(ex){}
//					this.innerHTML = JSON.stringify(data)
//					return data
//				})
//			})
//		}
//	},
//	attributeChangedCallback: {
//		value: function(name, oldValue, newValue){
//			if(name === "src"){
//				this.refresh()
//			}else{
//				console.error("unexpected attribute changed event: "+name)
//			}
//		}
//	},
//	connectedCallback: {
//		value: function(){
//			this.innerHTML= "[loading]"
//		}
//	},
//	createdCallback: {
//		value: function(){
//			var src= this.getAttribute("src")
//			if(src){
//				this.attributeChangedCallback("src", undefined, src)
//			}
//			this.innerHTML= "[loading]"
//		}
//	}
//})

Object.defineProperties(ResourceLabel, {
	observedAttributes: {
		enumerable: true,
		get: function(){
			return ["src"]
		}
	}
})

if(typeof customElements !== "undefined"){
	//customElements.define("resource-label", ResourceLabel, {extends: "span"})
}else{
	document.registerElement("resource-label", {
		prototype: ResourceLabel
	})
}
