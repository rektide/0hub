class ResourceList extends HTMLElement {
	constructor(){
		super()
	}
	static get observedAttributes(){
		return ["src"]
	}
	/**
	 * @override
	 */
	connectedCallback(){
		var src= this.getAttribute("src")
		if(src){
			this.refresh()
		}
		this.innerHTML = "[loading]"
	}
	refresh(){
		var src= this.getAttribute("src")
		this.data= fetch(src).then(response=> response.json())
		this.data.then(data=>{
			var html = ["<ol>"]
			data.forEach(function(item){
				html.push("<li>", item.toString(), "</li>")
			})
			html.push("</ol>")
			this.innerHTML= html.join("")
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
	customElements.define("resource-list", ResourceList);
}else{
	document.registerElement("resource-list", {
		prototype: ResourceList
	})
}
