import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, Store, Building2, RefreshCw, AlertCircle, Locate, ExternalLink } from 'lucide-react'

// Overpass API — finds real OSM nodes near coordinates
const OVERPASS = 'https://overpass-api.de/api/interpreter'

async function fetchNearbyMarkets(lat, lon, radiusM = 3000) {
  const query = `
    [out:json][timeout:25];
    (
      node["shop"="supermarket"](around:${radiusM},${lat},${lon});
      node["shop"="convenience"](around:${radiusM},${lat},${lon});
      node["amenity"="marketplace"](around:${radiusM},${lat},${lon});
      node["shop"="grocery"](around:${radiusM},${lat},${lon});
      way["shop"="supermarket"](around:${radiusM},${lat},${lon});
      way["amenity"="marketplace"](around:${radiusM},${lat},${lon});
    );
    out center 40;
  `
  const res  = await fetch(OVERPASS, {
    method: 'POST',
    body:   'data=' + encodeURIComponent(query),
  })
  const json = await res.json()
  return (json.elements ?? [])
    .filter(e => e.tags?.name)
    .map(e => {
      const lat2 = e.lat ?? e.center?.lat
      const lon2 = e.lon ?? e.center?.lon
      const type = e.tags.shop === 'supermarket' ? 'supermarket'
                 : e.tags.amenity === 'marketplace' ? 'palengke'
                 : 'store'
      return {
        id:      e.id,
        name:    e.tags.name,
        type,
        lat:     lat2,
        lon:     lon2,
        address: e.tags['addr:street'] ?? e.tags['addr:full'] ?? '',
        brand:   e.tags.brand ?? '',
      }
    })
    .filter(e => e.lat && e.lon)
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2-lat1)*Math.PI/180
  const dLon = (lon2-lon1)*Math.PI/180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function formatDist(m) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m/1000).toFixed(1)}km`
}

const TYPE_LABEL = { supermarket:'Supermarket', palengke:'Public Market', store:'Store' }
const TYPE_COLOR = { supermarket:'#3B82F6', palengke:'var(--forest-3)', store:'var(--ink-3)' }
const TYPE_ICON  = { supermarket: Building2, palengke: Store, store: Store }

// Simple SVG map using OpenStreetMap tile URLs rendered in an iframe
function SimpleMap({ userLat, userLon, markers }) {
  // Build Google Maps embed URL (no key needed for basic embed)
  const query = encodeURIComponent(
    markers.slice(0,1).map(m=>m.name).join(' ') || 'public market near me'
  )
  const gmapsUrl = `https://www.google.com/maps?q=${userLat},${userLon}&z=15&output=embed`

  return (
    <div style={{ width:'100%', height:380, borderRadius:'var(--r-xl)', overflow:'hidden', border:'1px solid var(--border)', position:'relative' }}>
      <iframe
        title="Market Map"
        src={gmapsUrl}
        width="100%"
        height="100%"
        style={{ border:0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {/* Overlay pin for user location */}
      <div style={{ position:'absolute', bottom:12, left:12, background:'white', borderRadius:'var(--r-md)', padding:'0.5rem 0.8rem', boxShadow:'var(--s2)', fontSize:'0.78rem', fontWeight:600, color:'var(--forest)', display:'flex', alignItems:'center', gap:'0.4rem', border:'1px solid var(--border)' }}>
        <Navigation size={13} color="var(--forest)"/> Your location
      </div>
    </div>
  )
}

export default function MarketLocatorPage() {
  const [status, setStatus]   = useState('idle') // idle | loading | success | error | denied
  const [userPos, setUserPos] = useState(null)
  const [markets, setMarkets] = useState([])
  const [filter, setFilter]   = useState('all')
  const [errMsg, setErrMsg]   = useState('')

  const locate = () => {
    if (!navigator.geolocation) {
      setStatus('error'); setErrMsg('Geolocation is not supported by your browser.'); return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        setUserPos({ lat, lon })
        try {
          const results = await fetchNearbyMarkets(lat, lon, 3000)
          // Sort by distance
          const withDist = results.map(m => ({
            ...m, dist: haversine(lat, lon, m.lat, m.lon)
          })).sort((a,b) => a.dist - b.dist)
          setMarkets(withDist)
          setStatus('success')
        } catch(e) {
          setStatus('error'); setErrMsg('Could not load nearby markets. Please try again.')
        }
      },
      (err) => {
        setStatus(err.code === 1 ? 'denied' : 'error')
        setErrMsg(err.code === 1
          ? 'Location access was denied. Please enable location permissions in your browser settings.'
          : 'Could not get your location. Please try again.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const filtered = filter === 'all' ? markets : markets.filter(m => m.type === filter)

  const nearest = markets[0] ?? null

  return (
    <div className="page-in">
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,var(--forest) 0%,var(--forest-2) 100%)', padding:'2.5rem 0', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(46,201,158,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(46,201,158,.05) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }}/>
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <p className="section-label" style={{ color:'var(--mint)' }}>
            <MapPin size={12} style={{ display:'inline', marginRight:4 }}/>
            Market Locator
          </p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:900, color:'white', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'0.5rem' }}>
            Find Markets Near You
          </h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.95rem', maxWidth:500, marginBottom:'1.5rem' }}>
            Locate the nearest palengke and supermarkets from your current location. Uses OpenStreetMap data.
          </p>
          {status !== 'success' && (
            <button className="btn btn-primary btn-lg" onClick={locate} disabled={status==='loading'}>
              {status==='loading'
                ? <><RefreshCw size={16} style={{ animation:'spin 0.8s linear infinite' }}/> Locating...</>
                : <><Locate size={16}/> Use My Location</>
              }
            </button>
          )}
          {status==='success' && (
            <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
              {[
                { val: markets.length, label:'Markets found' },
                { val: markets.filter(m=>m.type==='palengke').length, label:'Public markets' },
                { val: markets.filter(m=>m.type==='supermarket').length, label:'Supermarkets' },
              ].map(s=>(
                <div key={s.label}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:900, color:'var(--gold)', lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.5)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding:'2rem' }}>
        {/* Error / denied states */}
        {(status==='error' || status==='denied') && (
          <div style={{ maxWidth:560, margin:'0 auto' }}>
            <div className="err-box" style={{ marginBottom:'1.5rem' }}>
              <span className="err-box-icon"><AlertCircle size={20}/></span>
              <div>
                <p className="err-box-title">{status==='denied' ? 'Location Access Denied' : 'Location Error'}</p>
                <p className="err-box-msg">{errMsg}</p>
              </div>
            </div>
            <button className="btn btn-dark" onClick={locate}><RefreshCw size={15}/> Try Again</button>
          </div>
        )}

        {/* Idle state */}
        {status==='idle' && (
          <div className="empty-state">
            <div className="empty-icon"><MapPin size={32} color="var(--ink-3)"/></div>
            <h3 className="empty-title">Find Markets Near You</h3>
            <p className="empty-desc">Click the button above to find the nearest palengke and supermarkets in your area using your current location.</p>
            <button className="btn btn-primary" onClick={locate} style={{ marginTop:'0.5rem' }}>
              <Locate size={16}/> Use My Location
            </button>
          </div>
        )}

        {/* Loading */}
        {status==='loading' && (
          <div className="loader-wrap">
            <div className="loader-ring"/>
            <div className="loader-dots"><span/><span/><span/></div>
            <p className="loader-txt">Finding markets near you...</p>
          </div>
        )}

        {/* Results */}
        {status==='success' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:'2rem', alignItems:'start' }}>

            {/* Left: map + list */}
            <div>
              {/* Map */}
              <SimpleMap userLat={userPos.lat} userLon={userPos.lon} markers={markets}/>

              {/* Open in Google Maps */}
              <a
                href={`https://www.google.com/maps/search/palengke+supermarket/@${userPos.lat},${userPos.lon},15z`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ marginTop:'0.75rem', display:'inline-flex', textDecoration:'none' }}
              >
                <ExternalLink size={14}/> Open Full Map in Google Maps
              </a>

              {/* Filter tabs */}
              <div style={{ display:'flex', gap:'0.4rem', marginTop:'1.5rem', marginBottom:'1rem' }}>
                {['all','palengke','supermarket','store'].map(f=>(
                  <button key={f} onClick={()=>setFilter(f)}
                    className={`chip ${filter===f?'active':''}`}
                    style={{ textTransform:'capitalize' }}>
                    {f==='all' ? `All (${markets.length})` : `${TYPE_LABEL[f]??f} (${markets.filter(m=>m.type===f).length})`}
                  </button>
                ))}
              </div>

              {/* Market list */}
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {filtered.length===0 && (
                  <p style={{ color:'var(--ink-3)', fontSize:'0.875rem', padding:'2rem 0' }}>No {filter} found in 3km radius.</p>
                )}
                {filtered.map((m, i) => {
                  const Icon = TYPE_ICON[m.type] ?? Store
                  return (
                    <div key={m.id} style={{ background:'white', border:`1px solid ${i===0&&filter==='all'?'var(--mint)':'var(--border)'}`, borderRadius:'var(--r-lg)', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'1rem', boxShadow: i===0&&filter==='all'?'var(--smint)':'var(--s1)', transition:'all var(--fast)' }}
                      onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--s2)'}
                      onMouseLeave={e=>e.currentTarget.style.boxShadow=i===0&&filter==='all'?'var(--smint)':'var(--s1)'}
                    >
                      {/* Icon */}
                      <div style={{ width:42, height:42, background:`${TYPE_COLOR[m.type]}18`, border:`1px solid ${TYPE_COLOR[m.type]}30`, borderRadius:'var(--r-md)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icon size={20} color={TYPE_COLOR[m.type]}/>
                      </div>
                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                          <p style={{ fontWeight:700, fontSize:'0.92rem', color:'var(--ink)' }}>{m.name}</p>
                          {i===0&&filter==='all' && <span style={{ fontSize:'0.65rem', fontWeight:700, background:'var(--mint)', color:'var(--forest)', padding:'0.1rem 0.45rem', borderRadius:'99px' }}>NEAREST</span>}
                        </div>
                        <p style={{ fontSize:'0.78rem', color:'var(--ink-3)', marginTop:'0.1rem' }}>
                          {TYPE_LABEL[m.type]} {m.address && `· ${m.address}`}
                        </p>
                      </div>
                      {/* Distance */}
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'1rem', color: m.dist<500?'var(--forest-3)':m.dist<1500?'var(--orange)':'var(--ink-3)' }}>
                          {formatDist(m.dist)}
                        </div>
                        <div style={{ fontSize:'0.7rem', color:'var(--ink-3)' }}>away</div>
                      </div>
                      {/* Directions link */}
                      <a
                        href={`https://www.google.com/maps/dir/${userPos.lat},${userPos.lon}/${m.lat},${m.lon}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ flexShrink:0, textDecoration:'none' }}
                        title="Get directions"
                      >
                        <Navigation size={13}/> Go
                      </a>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: suggestion card */}
            <div style={{ position:'sticky', top:'calc(var(--nav-h) + 1.5rem)', display:'flex', flexDirection:'column', gap:'1rem' }}>
              {nearest && (
                <div style={{ background:'linear-gradient(135deg,var(--forest),var(--forest-2))', borderRadius:'var(--r-xl)', padding:'1.5rem', color:'white' }}>
                  <p style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--mint)', marginBottom:'0.75rem' }}>
                    🎯 Nearest Market
                  </p>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:700, marginBottom:'0.3rem' }}>{nearest.name}</h3>
                  <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.6)', marginBottom:'1rem' }}>
                    {TYPE_LABEL[nearest.type]} · {formatDist(nearest.dist)} away
                  </p>
                  <a
                    href={`https://www.google.com/maps/dir/${userPos.lat},${userPos.lon}/${nearest.lat},${nearest.lon}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ width:'100%', justifyContent:'center', textDecoration:'none' }}
                  >
                    <Navigation size={15}/> Get Directions
                  </a>
                </div>
              )}

              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'1.25rem' }}>
                <p style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700, color:'var(--ink)', marginBottom:'0.5rem' }}>💡 Shopping Tip</p>
                <p style={{ fontSize:'0.82rem', color:'var(--ink-3)', lineHeight:1.7 }}>
                  For fresh produce, meat, and fish — the palengke is usually cheaper. For packaged goods, condiments, and noodles — supermarkets often have lower prices. Check the Prices page to compare before you go!
                </p>
                <a href="/prices" className="btn btn-dark btn-sm" style={{ marginTop:'0.75rem', textDecoration:'none', display:'inline-flex' }}>
                  📊 View Price Comparison
                </a>
              </div>

              <div style={{ background:'var(--cream-2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'1rem', fontSize:'0.75rem', color:'var(--ink-3)', lineHeight:1.7 }}>
                <AlertCircle size={12} style={{ display:'inline', marginRight:4 }}/>
                Market data from <strong>OpenStreetMap</strong>. Results within 3km radius. Availability may vary. Tap "Get Directions" for navigation.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
