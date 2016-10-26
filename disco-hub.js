"use strict"

function forbidden(ff){
	ff.respondWith("", {
		status: 403,
		statusText: "Forbidden"
	})
}

function notFound(ff){
	ff.respondWith("", {
		status: 404,
		statusText: "Not Found"
	})
}

function idb(name){
	var defaults = new Promise(function(res,rej){
		var defaults= indexedDB.open("default")
		defaults.onupgradeneeded= function(){
			defaults.result.createObjectStore("defaults", {keyPath: "key"})
		}
		defaults.onsuccess= function(){
			resolve(defaults.result)
		}
		defaults.onerror= function(){
			reject(defaults.error)
		}
	})
}

function subdomainCheck(requested, origin){
	origin = origin || location.origin
	if(!requested){
		return origin
	}else if(requested.length === origin.length){
		return requested === origin ? requested : null
	}else if(requested.length > origin.length && requested[requested.length - origin.length - 1] === "."){
		return requested.endsWith(origin) ? requested : null
	}
}

const headers = {
	"Content-Type": "application/json"
}

function makeSet(prefix){
	const set= {}
	var db= idb(prefix)
	return {
		GET: function(ff, domain){
			if(!domain){
				if(!text){
					text= JSON.stringify(Object.keys(set))
				}
				ff.respondWith(new Response(text, {headers}))
			}else if(set[domain]){
				ff.respondWith(new Response())
			}else{
				notFound(ff);
			}
		},
		HEAD: function(ff, domain){
			if(domain && !set[domain]){
				return notFound()
			}
			ff.respondWith(new Response())
		},
		POST: function(ff, domain){
			var checked = subdomainCheck(domain)
			if(!checked){
				return forbidden()
			}
			if(domain){
				ff.respondWith(new Reponse())
			}else{
				ff.responedWith(new Reponse("", {
					status: 303,
					statusText: "See Other",
					headers: {
						Location: location.origin+ prefix+ "/"+ checked
					}
				}))
			}
			set[domain]= true
			text= null
		},
		DELETE: function(ff, domain){
			var checked = subdomainCheck(domain)
			if(!checked){
				return forbidden()
			}
			var existed = set[checked]
			if(!existed){
				return notFound()
			}

			if(domain){
				ff.respondWith(new Reponse())
			}else{
				ff.responedWith(new Reponse("", {
					status: 303,
					statusText: "See Other",
					headers: {
						Location: location.origin+ prefix+ "/"+ checked // now 404!
					}
				}))
			}
			delete set[domain]
			text= null
		}
	}
}

function requestHandle(request, ff){
	request.onsuccess= function(){
		ff.respondWith(new Response(request.result))
	}
	request.onerror= function(){
		notFound(ff)
	}
}


var defaults= idb("defaults")
function makeDefault(name){
	return {
		GET: function(ff){
			if(def === null){
				return notFound(ff)
			}
			var request= defaults.get(name)
		},
		HEAD: function(ff){
			if(def === null){
				return notFound(ff)
			}
			ff.respondWith(new Response())
		},
		POST: function(ff){
			ff.request.text().then(function(body){
				var request= defaults.put(name, body)
				request.onsuccess= function(){
					ff.respondWith(new Response())
				}
				request.onerror= function(){
					notFound(ff)
				}
			})
		},
		DELETE: function(ff){
			var request= defaults.delete(name)
			ff.respondWith(new Response())
		}
	}
}

var routes={
	//"": /^$/,
	b: /^b(?:\/([\w\.]+))?$/,
	db: /^db(?:\/)?$/,
	r: /^r(?:\/([\w\.]+))?$/,
	dr: /^dr(?:\/([\w\.]+))?$/,
	l: /^lb$/
}

var browsing= routes.b.handler= makeSet("b")
var browsingDefault= routes.db.handler= makeDefault("db")
var register= routes.r.handler= makeSet("r")
var registerDefault= routes.dr.handler= makeDefault("dr")
var browsingAutomatic= routes.l.handler= makeDefault("lb")
//routes[""].handler= {GET: browsing.GET, HEAD: browsing.HEAD}

function f(ff){
	var
	  path = ff.request.url.substring(self.registration.scope.length),
	  hint= path[0] || "",
	  regex= routes[hint]
	if(!regex){
		regex= routes[path.substring(0,2)]
	}
	if(regex){
		var ok= regex.exec(path),
		  handler= regex.handler[ff.request.method]
		if(ok&& handler){
			handler(ff, ok[1])
		}else{
			notFound(ff)
		}
	}
}

self.addEventListener("fetch", f, {passive: true})
self.addEventListener("foreignfetch", f, {passive: true})

self.addEventListener("install", function(install){
	var scopes= [
	    self.registration.scope + "b",
	    self.registration.scope + "db",
	    self.registration.scope + "r",
	    self.registration.scope + "dr",
	    self.registration.scope + "lb"],
	  origins= ["*"]
	install.registerForeignFetch({scopes, origins})
})
