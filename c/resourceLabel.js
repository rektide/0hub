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
		var src= this.getAttribute("src")
		this.data= fetch(src).then(function(response){
			if(response.status < 300){
				return response.json()
			}
			throw new Error("Bad status "+response.status)
		})
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

if(typeof customElements !== "undefined"){
	customElements.define("resource-label", ResourceLabel)
}else{
	document.registerElement("resource-label", {
		prototype: ResourceLabel
	})
}
