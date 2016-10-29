"use strict"

function forbidden(req){
	if(request){
		console.warn({status: 403, url: req.url})
	}
	return new Response(null, {status: 403})
}

function notFound(request){
	if(request){
		console.warn({status: 404, url: req.url})
	}
	return new Response(null, {status: 404})
}

function error500(request, error){
	var report= {status: 500}
	if(request){
		report.request= request
	}
	if(error){
		report.error= error
	}
	console.warn(report)
	return new Response(null, {status: 500})
}

function ok(body){
	return new Response(JSON.stringify(body), {
		status: 200,
		headers: {"content-type": "application/json"}
	})
}

function idb(name, {views}){
	views= views|| {}
	views.forbidden= views.forbidden|| forbidden
	views.notFound= views.notFound|| notFound
	views.error500= views.error500|| error500
	var db= new Promise(function(resolve, reject){
		var open= indexedDB.open(name, 1)
		open.onupgradeneeded= function(e){
			if(e.oldVersion < 1){
				open.result.createObjectStore( name)
			}
		}
		open.onsuccess= function(e){
			var result= e.currentTarget.result
			resolve(result)
		}
		open.onerror= function(e){
			var err= e.currentTarget.error
			reject(err)
		}
	})
	db.fetchGet= function(key, ff){
		console.log("fetchGet", name, key)
		return db.then(function(d){
			var get
			if(key !== undefined){
				get= d.transaction(name).objectStore(name).get(key)
			}else{
				get= d.transaction(name).objectStore(name).getAll()
			}
			return new Promise(function(resolve,reject){
				get.onsuccess= function(e){
					var result= e.currentTarget.result
					if(key !== undefined && views.get){
						result= views.get(result)
					}else if(views.getAll){
						result= views.getAll(result)
					}
					resolve(ok(result))
				}
				get.onerror= function(){
					var err= get.error
					if(views.error){
						err= views.error(err)
					}
					reject(error500(err))
				}
			})
		})
	}
	db.fetchPut= function( key, value, ff){
		return new Promise(function( resolve, reject){
			var put= db.transaction(name, "readwrite").objectStore(name).put(value, key).complete
			put.onsuccess= function(e){
				var result= e.currentTarget.result
				if(views.put){
					result= views.put(result)
				}
				if(ff){
					ff.respondWith(result)
				}
				resolve(result)
			}
			put.onerror= function(){
				var err= get.error
				if(views.error){
					err= views.error(err)
				}
				return err
			}
		})
	}
	db.fetchDelete= function( key, ff){
		return new Promise(function( resolve, reject){
			var del= db.transaction(name, "readwrite").objectStore(name).delete(key).complete
			del.onsuccess= function(e){
				var result= e.currentTarget.result
				if(views.del){
					result= views.delete(result)
				}
				if(ff){
					ff.respondWith(result)
				}
				resolve(result)
			}
			del.onerror= function(){
				var err= get.error
				if(views.error){
					err= views.error(err)
				}
				return err
			}
		})
	}
	return db
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
	var db= idb(prefix, {})
	return {
		GET: function(ff, domain){
			ff.respondWith(db.fetchGet(domain))
		},
		HEAD: function(ff, domain){
			var response= db.fetchGet(domain.then(x => ok("")))
			ff.respondWith(response)
		},
		POST: function(ff, domain){
			var checked = subdomainCheck(domain)
			if(!checked){
				return forbidden()
			}
			if(domain){
				ff.respondWith(new Reponse())
			}else{
				ff.responedWith(new Reponse({
					status: 303,
					statusText: "See Other",
					headers: {
						Location: location.origin+ prefix+ "/"+ checked
					}
				}))
			}
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

var defaults= idb("defaults", {})
function makeDefault(name){
	return {
		GET: function(ff){
			//if(def === null){
			//	return notFound(ff)
			//}
			//var request= defaults.get(name)
		},
		HEAD: function(ff){
			//if(def === null){
			//	return notFound(ff)
			//}
			//ff.respondWith(new Response())
		},
		POST: function(ff){
			//ff.request.text().then(function(body){
			//	var request= defaults.put(name, body)
			//	request.onsuccess= function(){
			//		ff.respondWith(new Response())
			//	}
			//	request.onerror= function(){
			//		notFound(ff)
			//	}
			//})
		},
		DELETE: function(ff){
			//var request= defaults.delete(name)
			//ff.respondWith(new Response())
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

routes.b.handler= makeSet("b")
routes.db.handler= makeDefault("db")
routes.r.handler= makeSet("r")
routes.dr.handler= makeDefault("dr")
routes.l.handler= makeDefault("lb")
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
			ff.respondWith(notFound())
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
