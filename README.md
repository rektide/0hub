# 0Hub

An implementation of ZeroConf rendezvous in the browser. Maybe someday with actual ZeroConf bridging.

The final goal is to create a well known origin for registration and discovery. This implementation arose as a fallback option while discussing [adding discovery to Navigator-Connect](https://github.com/mkruisselbrink/navigator-connect/issues/1), an early predecessor to Foreign Fetch. Hopefully this can one day prove the concept, and the browser can implement a discovery mechanism directly.

See also [Network Discovery](https://www.w3.org/TR/2014/WD-discovery-api-20140220/) before it was deprecated. This only allowed for finding network resources, not registering, but it shows initiative in the general direction.
