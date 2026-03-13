import { useState, useEffect, useRef } from "react";
import "./App.css";


// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
function readLocal(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(key, val) {
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

async function load(key) {
  const local = readLocal(key);
  if (local !== null) return local;

  try {
    if (window.storage?.get) {
      const legacy = await window.storage.get(key, false);
      if (legacy?.value) {
        const parsed = JSON.parse(legacy.value);
        writeLocal(key, parsed);
        return parsed;
      }
    }
  } catch {}

  return null;
}

async function save(key, val) {
  writeLocal(key, val);
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const DEFAULT_SECTIONS = [
  {
    id: "fe", label: "Frontend", emoji: "🖥️", color: "#3B82F6", custom: false,
    topics: [
      { id:"fe1", title:"var vs let vs const", desc:"Hoisting: var declarations are hoisted and initialized to undefined; let/const are hoisted but not initialized (temporal dead zone). var is function-scoped; let/const are block-scoped. const prevents reassignment but not mutation.", refs:["https://javascript.info/var","https://www.youtube.com/watch?v=9WIJQDvt4Us"] },
      { id:"fe2", title:"Closures & Scope", desc:"A closure is a function that remembers its outer scope even after the outer function returns. Scope chain: when a variable is referenced, JS walks up the scope chain until found. Key use: data encapsulation, factory functions, memoization.", refs:["https://javascript.info/closure","https://www.youtube.com/watch?v=vKJpN5FAeF4"] },
      { id:"fe3", title:"Prototypal Inheritance", desc:"Every JS object has a hidden [[Prototype]] property pointing to another object. Property lookup walks the prototype chain. Object.create(), class syntax, and constructor functions all use this system under the hood.", refs:["https://javascript.info/prototype-inheritance"] },
      { id:"fe4", title:"`this` keyword, call/apply/bind", desc:"'this' is determined at call time, not definition time. Regular function: this = caller. Arrow function: this = lexical outer scope. call/apply invoke immediately with a given this. bind returns a new function with this permanently set.", refs:["https://javascript.info/object-methods","https://www.youtube.com/watch?v=gvicrj31JOM"] },
      { id:"fe5", title:"Event Loop & Async Execution", desc:"JS is single-threaded. Call stack runs synchronous code. Web APIs handle async tasks (setTimeout, fetch). Microtask queue (Promises) has priority over macrotask queue (setTimeout). Event loop continuously checks if call stack is empty, then pushes from queue.", refs:["https://www.youtube.com/watch?v=8aGhZQkoFbQ","https://javascript.info/event-loop"] },
      { id:"fe6", title:"Promises & Promise combinators", desc:"A Promise represents an eventual value: pending → fulfilled/rejected. .then() chains. .catch() handles errors. Promise.all: waits for all, rejects on any failure. Promise.race: first settled wins. Promise.allSettled: waits for all regardless. Promise.any: first fulfilled.", refs:["https://javascript.info/promise-basics","https://www.youtube.com/watch?v=DHvZLI7Db8E"] },
      { id:"fe7", title:"async/await & error handling", desc:"async functions always return a Promise. await pauses execution inside the async function until the Promise settles. Use try/catch for error handling. await in a loop runs sequentially; Promise.all runs concurrently — important performance distinction.", refs:["https://javascript.info/async-await"] },
      { id:"fe8", title:"ES6+ features", desc:"Destructuring (arrays & objects), spread/rest operators, optional chaining (?.), nullish coalescing (??), template literals, default params, shorthand object properties, computed property names, for...of loops, Symbol, iterators.", refs:["https://javascript.info/destructuring-assignment"] },
      { id:"fe9", title:"DOM — Critical Rendering Path", desc:"Browser steps: Parse HTML → Build DOM. Parse CSS → Build CSSOM. Combine → Render Tree. Layout (calculate positions). Paint (draw pixels). Composite layers. Reflow = re-layout triggered by geometry changes (expensive). Repaint = visual update without layout change.", refs:["https://web.dev/critical-rendering-path/","https://www.youtube.com/watch?v=SmE4OwHztCc"] },
      { id:"fe10", title:"Event Bubbling, Capturing & Delegation", desc:"Bubbling: event fires on target, then bubbles up to root. Capturing: event fires from root down to target (capture phase). Event delegation: attach one listener on a parent to handle events from many children — efficient for dynamic lists.", refs:["https://javascript.info/bubbling-and-capturing"] },
      { id:"fe11", title:"localStorage / sessionStorage / Cookies", desc:"localStorage: persists forever, ~5MB, same origin only. sessionStorage: cleared when tab closes. Cookies: sent with every HTTP request, can be set by server, HttpOnly prevents JS access, smaller size limit. Use cookies for auth tokens (httpOnly), localStorage for UI preferences.", refs:["https://javascript.info/localstorage"] },
      { id:"fe12", title:"CSS Box Model & box-sizing", desc:"Every element: content + padding + border + margin. box-sizing: content-box (default) — width = content only. box-sizing: border-box — width includes padding and border (almost always what you want). Set * { box-sizing: border-box } globally.", refs:["https://css-tricks.com/box-sizing/"] },
      { id:"fe13", title:"Flexbox (all properties)", desc:"Container: display:flex, flex-direction, flex-wrap, justify-content (main axis), align-items (cross axis), align-content, gap. Items: flex-grow, flex-shrink, flex-basis, flex shorthand, align-self, order. One-dimensional layout.", refs:["https://css-tricks.com/snippets/css/a-guide-to-flexbox/","https://flexboxfroggy.com"] },
      { id:"fe14", title:"CSS Grid", desc:"Two-dimensional layout. Container: grid-template-columns/rows, grid-template-areas, gap, justify/align-items/content. Items: grid-column, grid-row, grid-area. Useful patterns: repeat(auto-fill, minmax(200px,1fr)) for responsive grids without media queries.", refs:["https://css-tricks.com/snippets/css/complete-guide-grid/","https://cssgridgarden.com"] },
      { id:"fe15", title:"Specificity, Cascade & Pseudo-classes", desc:"Specificity order: inline styles > #id > .class/[attr]/:pseudo-class > element/::pseudo-element. !important overrides all. Cascade: specificity → source order. :hover, :focus, :nth-child, :not(), ::before, ::after are most common.", refs:["https://specifishity.com"] },
      { id:"fe16", title:"Responsive Design & Media Queries", desc:"Mobile-first: design for small screen first, use min-width queries to scale up. Breakpoints are content-based not device-based. Viewport meta tag required. CSS units: %, vw/vh, rem (root-relative), em (parent-relative). Fluid typography with clamp().", refs:["https://web.dev/responsive-web-design-basics/"] },
      { id:"fe17", title:"React — Virtual DOM & Reconciliation", desc:"React keeps a virtual DOM in memory. On state change, creates a new vDOM tree and diffs it against the previous (reconciliation). Only applies minimal real DOM changes. Keys help React identify which list items changed — never use index as key if list order changes.", refs:["https://react.dev/learn/preserving-and-resetting-state","https://www.youtube.com/watch?v=BYbgopx44vo"] },
      { id:"fe18", title:"React Hooks — useState & useEffect", desc:"useState: returns [value, setter]. Setter triggers re-render. State updates are asynchronous and batched. useEffect: runs after render. Dependency array controls when it re-runs. Return a cleanup function to prevent memory leaks. Empty array = run once on mount.", refs:["https://react.dev/reference/react/useState","https://react.dev/reference/react/useEffect"] },
      { id:"fe19", title:"React Hooks — useMemo, useCallback, useRef", desc:"useCallback: memoizes a function reference — prevents child re-renders when passing callbacks. useMemo: memoizes a computed value — expensive calculations. useRef: persists a value across renders without causing re-render. Also used to access DOM nodes directly.", refs:["https://react.dev/reference/react/useCallback"] },
      { id:"fe20", title:"Custom Hooks", desc:"Extract stateful logic into reusable functions starting with 'use'. They can call other hooks. Examples: useFetch (data fetching), useDebounce, useLocalStorage, useOnClickOutside. They share logic, not state — each call creates independent state.", refs:["https://react.dev/learn/reusing-logic-with-custom-hooks"] },
      { id:"fe21", title:"React.memo, key prop, Code Splitting", desc:"React.memo: wraps a component to skip re-render if props unchanged (shallow comparison). key prop: tells React which items in a list correspond across renders. React.lazy + Suspense: dynamically import components — reduces initial bundle size.", refs:["https://react.dev/reference/react/memo"] },
      { id:"fe22", title:"Context API vs Redux", desc:"Context: built-in, good for low-frequency global state (theme, auth user). Problem: re-renders ALL consumers on every change. Redux: unidirectional flow (Action → Reducer → Store), great for complex state with many interactions. Redux Toolkit eliminates boilerplate.", refs:["https://react.dev/learn/passing-data-deeply-with-context","https://redux-toolkit.js.org/introduction/getting-started"] },
      { id:"fe23", title:"React Router — Dynamic & Protected Routes", desc:"v6: useNavigate, useParams, useLocation, Outlet for nested routes. Dynamic routes: /users/:id. Protected routes: wrap with a component that checks auth, redirects to login if not authenticated. Lazy-load route components for performance.", refs:["https://reactrouter.com/en/main/start/overview"] },
      { id:"fe24", title:"Next.js — Rendering Strategies", desc:"SSR (getServerSideProps): renders on each request — fresh data, slower TTFB. SSG (getStaticProps): renders at build time — fastest, stale data. ISR: SSG + revalidate interval. CSR: client-side fetch — flexible, but slower initial load. App Router uses React Server Components.", refs:["https://nextjs.org/docs/basic-features/data-fetching","https://www.youtube.com/watch?v=YkxrbxoqHDw"] },
      { id:"fe25", title:"TypeScript — Types, Interfaces & Generics", desc:"interface: extensible, declaration-mergeable, use for objects/classes. type: can express unions, intersections, mapped types — more flexible. Generics: type parameters that work with multiple types. function identity<T>(arg: T): T. Array<T> is generic.", refs:["https://www.typescriptlang.org/docs/handbook/2/everyday-types.html"] },
      { id:"fe26", title:"TypeScript — Utility Types", desc:"Partial<T>: all properties optional. Required<T>: all required. Pick<T,K>: subset of properties. Omit<T,K>: all except K. Record<K,V>: map type. Readonly<T>: immutable. ReturnType<F>: return type of a function. Parameters<F>: parameter types.", refs:["https://www.typescriptlang.org/docs/handbook/utility-types.html"] },
      { id:"fe27", title:"TypeScript — Type Narrowing & Guards", desc:"Type narrowing: TypeScript narrows the type within conditional blocks. typeof guard: typeof x === 'string'. instanceof guard: x instanceof Date. 'in' guard: 'property' in object. Discriminated unions: use a shared literal property to narrow union types.", refs:["https://www.typescriptlang.org/docs/handbook/2/narrowing.html"] },
      { id:"fe28", title:"Core Web Vitals — LCP, INP, CLS", desc:"LCP (Largest Contentful Paint): measures loading — target < 2.5s. Improve: optimize images, preload critical resources, reduce server response time. INP (Interaction to Next Paint): measures responsiveness. CLS (Cumulative Layout Shift): visual stability — always set image dimensions.", refs:["https://web.dev/vitals/","https://www.youtube.com/watch?v=AQqFZ5t8uNc"] },
      { id:"fe29", title:"Bundle Optimization — Tree Shaking & Lazy Loading", desc:"Tree shaking: bundler removes unused code. Requires ES modules (import/export). Avoid side-effect imports. Code splitting: webpack/Vite splits bundle at dynamic import() boundaries. Analyze bundle with webpack-bundle-analyzer. Lazy load images with loading='lazy'.", refs:["https://web.dev/reduce-javascript-payloads-with-code-splitting/"] },
      { id:"fe30", title:"Debounce vs Throttle", desc:"Debounce: delays execution until after N ms of inactivity — good for search input (don't fire on every keystroke). Throttle: executes at most once per N ms regardless of how many calls — good for scroll/resize handlers. Both implemented with setTimeout/clearTimeout.", refs:["https://css-tricks.com/debouncing-throttling-explained-examples/"] },
      { id:"fe31", title:"Testing — Jest, RTL, Cypress", desc:"Jest: test runner + assertion library. React Testing Library: render components, query by accessible roles (not implementation details). Cypress/Playwright: real browser E2E tests. Philosophy: test behavior not implementation. Mock external dependencies, not internals.", refs:["https://testing-library.com/docs/guiding-principles","https://www.youtube.com/watch?v=8Xwq35cPwYg"] },
    ]
  },
  {
    id: "be", label: "Backend", emoji: "⚙️", color: "#10B981", custom: false,
    topics: [
      { id:"be1", title:"Node.js Architecture — V8 + libuv", desc:"Node runs on V8 (JS engine) + libuv (C++ library for async I/O). Non-blocking I/O: instead of waiting for a file/network operation, Node registers a callback and continues. libuv uses OS-level async APIs (epoll on Linux, kqueue on macOS). This is why Node handles 10k connections on one thread.", refs:["https://www.youtube.com/watch?v=XUSHH0E-7zk"] },
      { id:"be2", title:"Event Loop Phases in Node.js", desc:"6 phases: timers (setTimeout/setInterval callbacks) → pending callbacks → idle/prepare → poll (fetch new I/O events) → check (setImmediate callbacks) → close callbacks. process.nextTick runs before any phase transition. Promise microtasks run after nextTick.", refs:["https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick"] },
      { id:"be3", title:"Streams & Backpressure", desc:"Streams process data in chunks without loading it all into memory. Types: Readable, Writable, Duplex, Transform. Piping: readable.pipe(writable). Backpressure: when consumer is slower than producer — writable.write() returns false, pause reading until 'drain' event.", refs:["https://nodejs.org/api/stream.html"] },
      { id:"be4", title:"Worker Threads & Cluster", desc:"Worker threads: run JS in parallel threads — for CPU-heavy tasks (image processing, crypto). Cluster: forks multiple Node processes, each on its own CPU core. Primary process distributes connections. PM2 manages clusters in production.", refs:["https://nodejs.org/api/worker_threads.html"] },
      { id:"be5", title:"Express — Middleware & Error Handling", desc:"Middleware: function(req, res, next). Runs in order registered. next() passes to next middleware. Error middleware: 4 args (err, req, res, next) — must be registered last. Router: groups related routes. Middleware can be global or route-specific.", refs:["https://expressjs.com/en/guide/using-middleware.html"] },
      { id:"be6", title:"REST API Design", desc:"Use nouns not verbs in URLs (/users not /getUsers). GET=read, POST=create, PUT=full replace, PATCH=partial update, DELETE=remove. Idempotent = same result when repeated (GET/PUT/DELETE). POST is NOT idempotent. Return appropriate status codes. Version your API (/v1/users).", refs:["https://restfulapi.net/","https://www.youtube.com/watch?v=lsMQRaeKNDk"] },
      { id:"be7", title:"HTTP Status Codes", desc:"2xx: 200 OK, 201 Created, 204 No Content. 3xx: 301 Moved Permanently, 304 Not Modified. 4xx client errors: 400 Bad Request, 401 Unauthorized (not authenticated), 403 Forbidden (authenticated but no permission), 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 429 Too Many Requests. 5xx: 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable.", refs:["https://httpstatuses.io"] },
      { id:"be8", title:"Pagination — Offset vs Cursor", desc:"Offset: LIMIT 10 OFFSET 20. Simple but slow on large datasets (DB scans skipped rows) and inconsistent (new rows shift offsets). Cursor: WHERE id > lastSeenId LIMIT 10. Consistent, fast (indexed), but can't jump to arbitrary pages. Use cursor for feeds; offset for admin tables.", refs:["https://use-the-index-luke.com/sql/partial-results/fetch-next-page"] },
      { id:"be9", title:"JWT — Structure, Storage & Refresh Tokens", desc:"JWT: base64(header).base64(payload).signature. Server verifies signature with secret. Stateless — no DB lookup. Store in httpOnly cookie (not localStorage — prevents XSS theft). Short-lived access token (15min) + long-lived refresh token (7 days in httpOnly cookie). On expiry, use refresh token to get new access token.", refs:["https://jwt.io/introduction","https://www.youtube.com/watch?v=7Q17ubqLfaM"] },
      { id:"be10", title:"OAuth2 — Authorization Code & PKCE", desc:"OAuth2 is a delegation framework — 'log in with Google'. Authorization Code flow: user → auth server → code → exchange for token. PKCE (Proof Key for Code Exchange): adds code_verifier/code_challenge to prevent code interception. Required for SPAs and mobile apps. OpenID Connect adds identity (id_token) on top of OAuth2.", refs:["https://www.oauth.com/oauth2-servers/pkce/"] },
      { id:"be11", title:"RBAC — Role-Based Access Control", desc:"Assign permissions to roles (admin, editor, viewer), not directly to users. Users get roles. Check: does this user's role have permission X? Implementation: middleware that checks req.user.role against a permission map. ABAC (Attribute-Based) is more granular — checks attributes like department, ownership.", refs:["https://www.youtube.com/watch?v=4Uya_I_Oxjk"] },
      { id:"be12", title:"Caching Patterns", desc:"Cache-aside (lazy): check cache → miss → fetch DB → write to cache. Most common. Write-through: write to cache AND DB simultaneously — always consistent, slower writes. Write-behind: write to cache only, async flush to DB — fast writes, risk of loss. Read-through: cache fetches from DB on miss automatically.", refs:["https://codeahoy.com/2017/08/11/caching-strategies-and-how-to-choose-the-right-one/"] },
      { id:"be13", title:"Redis — Data Structures & Use Cases", desc:"String: simple cache, counters (INCR). Hash: store objects (HSET user:1 name John). List: message queues, activity feeds (LPUSH/RPOP). Set: unique items, tags, social graph. Sorted Set: leaderboards, rate limiting by score. Pub/Sub: real-time messaging between services.", refs:["https://redis.io/docs/data-types/","https://www.youtube.com/watch?v=jgpVdJB2sKQ"] },
      { id:"be14", title:"Cache Stampede & Thundering Herd", desc:"Stampede: a popular cache key expires, thousands of requests simultaneously hit the DB. Solutions: 1) Probabilistic early expiration (randomly expire slightly before TTL). 2) Locking: first request gets a lock and rebuilds cache, others wait. 3) Stale-while-revalidate: serve stale while one request rebuilds.", refs:["https://engineering.fb.com/2015/12/03/ios/facebook-cache-stampede-solution/"] },
      { id:"be15", title:"Background Jobs & BullMQ", desc:"Offload slow tasks (email, image resize, PDF generation) to background workers. BullMQ uses Redis as the queue. Job lifecycle: waiting → active → completed/failed. Retry with exponential backoff. Dead letter queue for permanently failed jobs. Cron jobs for scheduled tasks.", refs:["https://docs.bullmq.io/"] },
      { id:"be16", title:"FastAPI — Pydantic, DI, Async", desc:"Pydantic: data validation with Python type hints — automatic request/response validation. Dependency injection: Depends() — reusable logic (get DB session, get current user). async endpoints: non-blocking with asyncio. Auto-generates OpenAPI docs at /docs. Background tasks for fire-and-forget operations.", refs:["https://fastapi.tiangolo.com/tutorial/"] },
      { id:"be17", title:"Testing — Unit, Integration, API", desc:"Unit: test a function in isolation, mock all dependencies. Integration: test multiple components together (function + DB). API: test HTTP endpoints end-to-end with Supertest (Node) or httpx (Python). Test doubles: mock (verify calls), stub (return fixed value), spy (wrap real function), fake (simplified implementation).", refs:["https://martinfowler.com/bliki/TestDouble.html"] },
      { id:"be18", title:"CORS — How it Works & Configuration", desc:"CORS: browser security that blocks cross-origin requests. Preflight: browser sends OPTIONS request with Origin header — server responds with allowed origins/methods/headers. Simple requests (GET/POST with basic headers) don't preflight. Never use Access-Control-Allow-Origin: * for authenticated endpoints.", refs:["https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"] },
      { id:"be19", title:"Request Validation — Zod / Joi", desc:"Validate request body/params/query before processing. Zod (TypeScript-first): z.object({ name: z.string().min(1), age: z.number().int().positive() }). Parse with .parse() (throws) or .safeParse() (returns result). Generate TypeScript types from schemas with z.infer<>.", refs:["https://zod.dev/","https://www.youtube.com/watch?v=L6BE-U3oy80"] },
      { id:"be20", title:"API Versioning Strategies", desc:"URL versioning (/v1/users): most visible, easiest to test, breaks bookmarks. Header versioning (Accept: application/vnd.api+json;version=1): cleaner URLs, harder to test. Query param (?version=1): simple, pollutes query. Recommendation: URL versioning for public APIs. Always deprecate don't delete.", refs:["https://www.freecodecamp.org/news/how-to-version-a-rest-api/"] },
      { id:"be21", title:"Session-based Auth vs JWT", desc:"Sessions: server stores session in DB/Redis, sends session ID cookie to client. Stateful — easy to revoke, scales poorly without shared session store. JWT: stateless — all data in token, verified with signature. Hard to revoke (need blocklist). Sessions better for monoliths; JWT better for microservices/mobile.", refs:["https://www.youtube.com/watch?v=UBUNrFtufWo"] },
    ]
  },
  {
    id: "net", label: "Networking", emoji: "🌐", color: "#8B5CF6", custom: false,
    topics: [
      { id:"net1", title:"OSI Model — All 7 Layers", desc:"7→1: Application (HTTP, DNS, FTP), Presentation (encryption, compression), Session (connection management), Transport (TCP/UDP, ports), Network (IP routing), Data Link (MAC addresses, Ethernet), Physical (bits, cables). Interview trick: All People Seem To Need Data Processing.", refs:["https://www.youtube.com/watch?v=vv4y_uOneC0"] },
      { id:"net2", title:"TCP vs UDP", desc:"TCP: connection-oriented (3-way handshake), reliable (acknowledgments, retransmission), ordered, flow/congestion control. Slower. Use for: HTTP, email, file transfer. UDP: connectionless, unreliable, no ordering, no handshake. Faster. Use for: video streaming, gaming, DNS, VoIP. QUIC (HTTP/3) adds reliability on top of UDP.", refs:["https://www.youtube.com/watch?v=qqRYkcFe-5E"] },
      { id:"net3", title:"TCP Handshake & Teardown", desc:"3-way handshake: SYN (client wants to connect) → SYN-ACK (server acknowledges, also syncs) → ACK (client acknowledges). Connection established. 4-way teardown: FIN → ACK → FIN → ACK. TIME_WAIT state ensures delayed packets don't corrupt new connections. TLS adds another 1-2 RTT on top.", refs:["https://www.youtube.com/watch?v=xMtP5ZB3wSk"] },
      { id:"net4", title:"DNS — End-to-End Resolution", desc:"Check: browser cache → OS cache (/etc/hosts) → Recursive resolver (ISP/8.8.8.8) → Root nameserver (knows TLD servers) → TLD nameserver (.com server) → Authoritative nameserver (knows your domain). Result cached at each level by TTL. Try: dig +trace google.com", refs:["https://www.youtube.com/watch?v=uOfonONtIuk"] },
      { id:"net5", title:"HTTP/1.1 vs HTTP/2 vs HTTP/3", desc:"HTTP/1.1: one request per connection (HOL blocking), keep-alive helped, but pipelining rarely worked. HTTP/2: multiplexing (multiple requests over 1 TCP connection), header compression (HPACK), server push. HTTP/3: uses QUIC (UDP-based) — eliminates TCP HOL blocking, faster handshake (0-RTT reconnects).", refs:["https://www.youtube.com/watch?v=a-sBfyiXysI","https://http3-explained.haxx.se/"] },
      { id:"net6", title:"Important HTTP Headers", desc:"Request: Authorization, Content-Type, Accept, Cookie, If-None-Match (ETag caching), Cache-Control. Response: Set-Cookie, ETag, Cache-Control (max-age, no-cache, no-store), Expires, CORS headers (Access-Control-Allow-Origin), Strict-Transport-Security, Content-Security-Policy.", refs:["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers"] },
      { id:"net7", title:"Cookies — Attributes & Security", desc:"HttpOnly: JS cannot access — prevents XSS stealing cookie. Secure: only sent over HTTPS. SameSite=Strict: never sent cross-site. SameSite=Lax: sent on top-level navigation only. SameSite=None + Secure: sent cross-site (for OAuth). Domain/Path: scoping. Expires/Max-Age: persistence.", refs:["https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies"] },
      { id:"net8", title:"TLS Handshake", desc:"TLS 1.3 handshake (1-RTT): Client Hello (supported ciphers) → Server Hello (chosen cipher + certificate) → Key exchange (ECDH — both derive same session key without transmitting it) → Finished. All subsequent data encrypted with symmetric session key. Certificate chain validated against browser's trusted CA store.", refs:["https://tls13.xargs.org/","https://www.youtube.com/watch?v=86cQJ0MMses"] },
      { id:"net9", title:"WebSockets vs SSE vs Long Polling", desc:"Long polling: client requests, server holds until data available, then responds — client immediately requests again. SSE: server pushes events over persistent HTTP connection, client can't send. WebSockets: full-duplex, bidirectional over single TCP connection. Use SSE for server-to-client streams; WebSockets for chat/games.", refs:["https://www.youtube.com/watch?v=n9mRjkQg3VE"] },
      { id:"net10", title:"CDN — How It Works", desc:"CDN caches assets at edge nodes globally. User request goes to nearest edge. On cache hit: served from edge (fast). On miss: edge fetches from origin, caches with Cache-Control headers. s-maxage: CDN TTL. stale-while-revalidate: serve stale while background revalidation. Invalidation: purge API or versioned URLs.", refs:["https://www.cloudflare.com/learning/cdn/what-is-a-cdn/"] },
      { id:"net11", title:"L4 vs L7 Load Balancing", desc:"L4 (Transport layer): routes by IP + port, fast, no content inspection, can't do path-based routing. L7 (Application layer): routes by HTTP headers, URL, cookies — enables A/B testing, blue-green deploys, path-based routing. Sticky sessions: route same client to same server (needed for stateful apps).", refs:["https://www.youtube.com/watch?v=aKMLgFVxZYk"] },
      { id:"net12", title:"Forward Proxy vs Reverse Proxy", desc:"Forward proxy: sits between client and internet — client knows about it (VPN, corporate proxy). Hides client IP. Reverse proxy: sits between internet and servers — client doesn't know about it (nginx, Cloudflare). Hides server IPs, handles SSL termination, load balancing, caching.", refs:["https://www.youtube.com/watch?v=4NB0NDtOwIQ"] },
      { id:"net13", title:"DNS Record Types", desc:"A: IPv4 address. AAAA: IPv6. CNAME: alias (points to another hostname, not IP). MX: mail server for domain. TXT: arbitrary text (SPF, DKIM verification). NS: authoritative nameserver for domain. SOA: start of authority, serial number for zone transfers. PTR: reverse DNS (IP → hostname).", refs:["https://www.cloudflare.com/learning/dns/dns-records/"] },
      { id:"net14", title:"TLS Certificate Chain & HSTS", desc:"Certificate chain: your cert signed by intermediate CA, signed by root CA. Browser trusts root CA (pre-installed). Intermediate CA reduces risk if root is compromised. HSTS (HTTP Strict Transport Security): tells browser to only ever use HTTPS for this domain — prevents SSL stripping attacks.", refs:["https://letsencrypt.org/how-it-works/"] },
      { id:"net15", title:"IP Addressing, Subnets & CIDR", desc:"IPv4: 32-bit, dotted decimal (192.168.1.1). Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. CIDR notation: /24 = 256 addresses, /16 = 65536. Subnetting: divides network into smaller networks. NAT: maps private IPs to public IP for internet access.", refs:["https://www.youtube.com/watch?v=s_gy_mWhVMc"] },
      { id:"net16", title:"gRPC & Protocol Buffers", desc:"gRPC: high-performance RPC framework by Google. Uses Protocol Buffers (protobuf) — binary serialization, much smaller than JSON. Supports: unary, server streaming, client streaming, bidirectional streaming. HTTP/2 based. Strong typing from .proto files. Great for microservice-to-microservice communication.", refs:["https://grpc.io/docs/what-is-grpc/introduction/"] },
      { id:"net17", title:"Scaling WebSockets Horizontally", desc:"Problem: WebSocket connections are stateful — client is connected to one server. When you add servers, client reconnects to a different server that has no context. Solutions: 1) Sticky sessions (IP hash load balancing). 2) Redis Pub/Sub — all servers subscribe, message published to all. 3) Centralized message broker (Kafka).", refs:["https://www.youtube.com/watch?v=2Nt-ZrNP22A"] },
      { id:"net18", title:"Rate Limiting Algorithms", desc:"Fixed Window: count requests per time window. Simple but allows burst at window boundary. Sliding Window Log: track timestamps of each request — accurate but memory-heavy. Token Bucket: bucket holds N tokens, each request consumes 1, tokens refill at rate R — allows bursts. Leaky Bucket: process requests at constant rate.", refs:["https://www.youtube.com/watch?v=FU4WlwfS3G0"] },
      { id:"net19", title:"HTTP Caching — ETag & Cache-Control", desc:"Cache-Control: max-age=3600 (cache for 1 hour), no-cache (revalidate before using), no-store (never cache), private (browser only), public (CDN cacheable). ETag: server sends hash of resource. Client sends If-None-Match on next request. 304 Not Modified if unchanged — saves bandwidth.", refs:["https://web.dev/http-cache/"] },
      { id:"net20", title:"CORS — Preflight & Configuration", desc:"Same-origin policy blocks cross-origin requests by default. CORS allows servers to whitelist origins. Simple requests (GET/POST + simple headers): no preflight. Complex requests (PUT/DELETE/custom headers): browser sends OPTIONS preflight first. Never use wildcard (*) with credentials: true.", refs:["https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"] },
    ]
  },
  {
    id: "db", label: "Databases", emoji: "🗄️", color: "#F59E0B", custom: false,
    topics: [
      { id:"db1", title:"SQL — JOINs & Aggregations", desc:"INNER JOIN: only matching rows. LEFT JOIN: all left rows + matching right (null if no match). SELF JOIN: join table to itself (employee-manager). Aggregations: COUNT, SUM, AVG, MIN, MAX with GROUP BY. HAVING filters aggregated results (WHERE filters rows before aggregation).", refs:["https://www.youtube.com/watch?v=9yeOJ0ZMUYw"] },
      { id:"db2", title:"SQL — CTEs & Window Functions", desc:"CTE (WITH clause): named subquery for readability, can be recursive. Window functions: operate over a window of rows without collapsing like GROUP BY. ROW_NUMBER(): unique rank. RANK(): gaps on ties. DENSE_RANK(): no gaps. LEAD/LAG: access next/previous row. PARTITION BY: separate windows.", refs:["https://mode.com/sql-tutorial/sql-window-functions/"] },
      { id:"db3", title:"PostgreSQL — EXPLAIN ANALYZE", desc:"EXPLAIN: shows query plan without running. EXPLAIN ANALYZE: runs and shows actual vs estimated rows/time. Look for: Seq Scan (full table scan — needs index?), high actual rows vs estimate (stale statistics — run VACUUM ANALYZE), nested loop with many rows (may need a hash join). Use auto_explain for slow query logging.", refs:["https://explain.dalibo.com/","https://www.postgresql.org/docs/current/using-explain.html"] },
      { id:"db4", title:"Indexing — Types & Strategy", desc:"B-tree (default): range queries, equality, ORDER BY, most use cases. Hash: equality only, faster for exact match. Composite: column order matters — leftmost columns must be in WHERE clause. Partial: WHERE is_active = true — smaller, faster. Covering: include all columns needed so query never hits table.", refs:["https://use-the-index-luke.com/"] },
      { id:"db5", title:"ACID Properties", desc:"Atomicity: transaction is all-or-nothing (BEGIN/COMMIT/ROLLBACK). Consistency: DB goes from one valid state to another (constraints, cascades). Isolation: concurrent transactions don't see each other's partial work. Durability: committed data survives crashes (WAL — Write-Ahead Log persists to disk before committing).", refs:["https://www.youtube.com/watch?v=pomxJOFVcQs"] },
      { id:"db6", title:"Isolation Levels", desc:"Read Uncommitted: can read uncommitted data (dirty reads). Read Committed (default PG): only reads committed data. Repeatable Read: same query returns same result within transaction (no non-repeatable reads). Serializable: complete isolation — transactions behave as if run serially. Higher isolation = more locking = less throughput.", refs:["https://www.postgresql.org/docs/current/transaction-iso.html"] },
      { id:"db7", title:"Optimistic vs Pessimistic Locking", desc:"Pessimistic: lock the row before reading (SELECT FOR UPDATE) — prevents conflicts, reduces concurrency. Optimistic: read without locking, include version number — on write, check version hasn't changed; if it has, retry. Better for read-heavy systems with rare conflicts. Deadlocks: two transactions each waiting for the other's lock.", refs:["https://www.youtube.com/watch?v=I8IlO0hCSgY"] },
      { id:"db8", title:"NoSQL — MongoDB", desc:"Document model: JSON-like BSON documents in collections. Schema-flexible. Aggregation pipeline: $match → $group → $project → $sort. Indexes: single field, compound, text, geospatial. Denormalization: embed related data vs reference. Good for: unstructured data, horizontal scaling. Bad for: complex joins.", refs:["https://www.mongodb.com/docs/manual/aggregation/"] },
      { id:"db9", title:"NoSQL — DynamoDB", desc:"Key-value + document store. Primary key: partition key (hash) alone or + sort key. Partition key determines which physical partition. GSI (Global Secondary Index): different partition key. LSI (Local Secondary Index): same partition key, different sort key. Two capacity modes: provisioned (predictable) vs on-demand.", refs:["https://www.youtube.com/watch?v=OfZgHXsYqNE"] },
      { id:"db10", title:"SQL vs NoSQL — Selection Criteria", desc:"Use SQL when: complex queries/JOINs needed, strong consistency required, schema is stable, ACID transactions critical (finance). Use NoSQL when: horizontal scaling needed, schema changes frequently, high write throughput, data is hierarchical/document-like. MongoDB for documents, Redis for cache, DynamoDB for serverless scale.", refs:["https://www.youtube.com/watch?v=W2Z7fbCLSTw"] },
      { id:"db11", title:"Connection Pooling", desc:"Opening a new DB connection is expensive (authentication, SSL, process allocation). Pool: maintain N pre-opened connections, reuse them. PgBouncer for PostgreSQL. Pool size: (num_cores * 2) + effective_spindle_count is a common heuristic. Too many connections = thrashing. Max connections in PG default is 100.", refs:["https://www.pgbouncer.org/"] },
      { id:"db12", title:"Read Replicas & Replication Lag", desc:"Primary-replica: all writes go to primary, async replicated to replicas. Replicas serve reads — reduces primary load. Replication lag: replicas may be seconds behind. Problem: user writes data then reads from replica — may see stale data. Solution: route user's reads to primary for N seconds after a write (read-your-writes consistency).", refs:["https://www.youtube.com/watch?v=GE9T74o_Qvs"] },
      { id:"db13", title:"Sharding Strategies", desc:"Range sharding: shard by value range (users A-M on shard 1). Simple but creates hot spots if range is uneven. Hash sharding: hash(key) % num_shards — even distribution, can't do range queries. Directory-based: lookup service maps keys to shards — flexible but lookup is bottleneck. Resharding when adding shards is painful.", refs:["https://www.youtube.com/watch?v=5faMjKuB9bc"] },
      { id:"db14", title:"Consistent Hashing", desc:"Problem with hash(key) % N: when N changes (add/remove server), most keys remap. Consistent hashing: place servers and keys on a ring, each key maps to the next server clockwise. Adding/removing a server only remaps keys from/to adjacent servers. Virtual nodes: each server has multiple ring positions for even distribution.", refs:["https://www.youtube.com/watch?v=zaRkONvyGr8"] },
      { id:"db15", title:"CAP Theorem", desc:"In a distributed system with network partitions (always possible), choose: CP (Consistency + Partition Tolerance) — system becomes unavailable during partition to stay consistent. E.g., ZooKeeper, HBase. AP (Availability + Partition Tolerance) — serves potentially stale data during partition. E.g., Cassandra, DynamoDB. CA is impossible in distributed systems.", refs:["https://www.youtube.com/watch?v=BHqjEjzAicA"] },
      { id:"db16", title:"PostgreSQL — JSONB & Partitioning", desc:"JSONB: binary JSON stored efficiently, supports indexing (GIN index), operators (@>, ?, #>>). Better than JSON type for querying. Partitioning: split large table into smaller physical tables by range (created_at), list (region), or hash. Improves query performance and allows archiving old partitions.", refs:["https://www.postgresql.org/docs/current/datatype-json.html"] },
      { id:"db17", title:"Database Transactions — Patterns", desc:"Saga pattern for distributed transactions: series of local transactions, each publishing events. Compensating transactions for rollback. Two-phase commit (2PC): coordinator asks all nodes to prepare, then commits — strong consistency but blocks on failure. Outbox pattern: write to local DB + outbox table atomically, then async publish events.", refs:["https://microservices.io/patterns/data/saga.html"] },
      { id:"db18", title:"Indexing — When NOT to Index", desc:"Don't index: low cardinality columns (boolean, status with 3 values) — index won't help. Write-heavy tables — every write updates all indexes. Small tables — full scan is faster. Redundant indexes — composite (a,b) makes index (a) redundant. Too many indexes slow down writes and waste storage.", refs:["https://use-the-index-luke.com/sql/where-clause/the-equals-operator/low-selectivity"] },
      { id:"db19", title:"CQRS Pattern", desc:"Command Query Responsibility Segregation: separate the write model (commands that change state) from the read model (queries that return data). Write model optimized for consistency and business logic. Read model optimized for query performance (denormalized, materialized views). Sync via events. Increases complexity but enables independent scaling.", refs:["https://martinfowler.com/bliki/CQRS.html"] },
    ]
  },
  {
    id: "sql", label: "SQL Deep Dive", emoji: "🧠", color: "#E879F9", custom: false,
    topics: [
      { id:"sql1", title:"SQL Order of Execution", desc:"Logical order is different from how you write the query: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT/OFFSET. This is why aliases created in SELECT are usually not available in WHERE, and why aggregate filters belong in HAVING.", refs:["https://www.postgresql.org/docs/current/sql-select.html"] },
      { id:"sql2", title:"DDL vs DML vs DCL vs TCL", desc:"DDL changes schema (CREATE, ALTER, DROP). DML changes data (SELECT, INSERT, UPDATE, DELETE, MERGE). DCL controls permissions (GRANT, REVOKE). TCL controls transactions (BEGIN, COMMIT, ROLLBACK, SAVEPOINT). Interviewers often ask this because it frames what each statement category is for.", refs:["https://www.postgresql.org/docs/current/reference.html"] },
      { id:"sql3", title:"Primary Key, Unique, Foreign Key, Check, Not Null", desc:"PRIMARY KEY means UNIQUE + NOT NULL and identifies a row. UNIQUE prevents duplicates but usually allows NULL behavior depending on DB rules. FOREIGN KEY enforces referential integrity to a parent table. CHECK enforces custom business rules. NOT NULL blocks missing values where the field is required.", refs:["https://www.postgresql.org/docs/current/ddl-constraints.html","https://www.postgresql.org/docs/current/sql-createtable.html"] },
      { id:"sql4", title:"NULL Semantics & Three-Valued Logic", desc:"NULL means unknown/missing, not zero or empty string. Comparisons with NULL do not evaluate to true/false in the normal way; they become unknown, so use IS NULL / IS NOT NULL instead of = NULL. COALESCE can provide fallback values. NULL handling is one of the most common sources of interview mistakes.", refs:["https://www.postgresql.org/docs/current/functions-conditional.html"] },
      { id:"sql5", title:"INNER vs LEFT vs RIGHT vs FULL JOIN", desc:"INNER returns only matching rows. LEFT returns all left rows plus matching right rows. RIGHT is the mirror of LEFT. FULL OUTER returns all rows from both sides with NULLs where there is no match. For interview questions, always explain which table is preserved and why row counts may change.", refs:["https://www.postgresql.org/docs/current/tutorial-join.html"] },
      { id:"sql6", title:"Subqueries — IN, EXISTS, ANY, ALL", desc:"Use IN when comparing against a small set of values returned by a subquery. EXISTS checks whether at least one matching row exists and is often the safest option for correlation. ANY/SOME and ALL compare against an entire set. Correlated subqueries run with reference to the outer row, which can impact performance.", refs:["https://www.postgresql.org/docs/current/functions-subquery.html"] },
      { id:"sql7", title:"UNION vs UNION ALL vs INTERSECT vs EXCEPT", desc:"UNION removes duplicates, so it has extra work. UNION ALL keeps duplicates and is faster when deduplication is unnecessary. INTERSECT returns rows present in both result sets. EXCEPT returns rows in the first result but not the second. The participating SELECTs must produce compatible column counts and types.", refs:["https://www.postgresql.org/docs/current/queries-union.html"] },
      { id:"sql8", title:"GROUP BY, HAVING, and Aggregate Pitfalls", desc:"GROUP BY collapses rows into groups. HAVING filters groups after aggregation, while WHERE filters rows before grouping. Common mistake: selecting non-aggregated columns that are not grouped. Another common interview trap is mixing row-level filters and aggregate filters in the wrong clause.", refs:["https://www.postgresql.org/docs/current/sql-select.html"] },
      { id:"sql9", title:"Window Functions — Ranking & Running Totals", desc:"Window functions compute values across related rows without collapsing them. Typical patterns: ROW_NUMBER for deduplication, RANK/DENSE_RANK for leaderboards, SUM() OVER for running totals, LAG/LEAD for previous and next row comparisons. PARTITION BY restarts the window per logical group.", refs:["https://www.postgresql.org/docs/current/tutorial-window.html"] },
      { id:"sql10", title:"CASE, COALESCE, NULLIF", desc:"CASE adds conditional logic inside SQL. COALESCE returns the first non-NULL value and is useful for defaults. NULLIF returns NULL when two expressions are equal, useful to avoid divide-by-zero issues or normalize sentinel values. These functions are heavily used in analytics and data-cleaning style interview questions.", refs:["https://www.postgresql.org/docs/current/functions-conditional.html"] },
      { id:"sql11", title:"Views vs Materialized Views", desc:"A normal view stores a query definition and runs the query when referenced. A materialized view stores the query result physically and must be refreshed to stay current. Use views for abstraction and security boundaries; use materialized views for expensive queries that benefit from precomputation.", refs:["https://www.postgresql.org/docs/current/sql-createview.html","https://www.postgresql.org/docs/current/sql-creatematerializedview.html"] },
      { id:"sql12", title:"Normalization vs Denormalization", desc:"Normalization reduces redundancy and update anomalies by splitting data into related tables with keys. Denormalization duplicates selected data to optimize reads, reporting, or caching. In interviews, explain the tradeoff clearly: normalized models improve consistency, while denormalized models can improve read performance at the cost of more complex writes.", refs:["https://www.postgresql.org/docs/current/ddl-constraints.html"] },
      { id:"sql13", title:"SARGability & Why Queries Miss Indexes", desc:"A predicate is sargable when the database can use an index efficiently to search arguments. Wrapping indexed columns in functions, using leading wildcards, or mixing incompatible data types can prevent index usage. Good interview answer: compare WHERE created_at >= ? with WHERE DATE(created_at) = ? and explain why the latter often scans more data.", refs:["https://www.postgresql.org/docs/current/indexes.html"] },
      { id:"sql14", title:"Composite Indexes & Leftmost Prefix Rule", desc:"Composite indexes speed queries that filter or sort on multiple columns, but column order matters. A B-tree index on (a, b, c) is most useful when predicates begin with a, then optionally b, then c. Design the index around the most selective and most common access pattern, not just around the query text.", refs:["https://www.postgresql.org/docs/current/indexes-multicolumn.html"] },
      { id:"sql15", title:"Transactions, SAVEPOINT, and Partial Rollback", desc:"Transactions bundle multiple statements into an all-or-nothing unit. SAVEPOINT lets you roll back part of a transaction without discarding the whole thing. This matters when you need finer-grained recovery inside a long workflow. Great interview example: import 100 rows, roll back only the failed row batch, then continue.", refs:["https://www.postgresql.org/docs/current/tutorial-transactions.html"] },
      { id:"sql16", title:"Stored Procedures, Functions, and Triggers", desc:"Functions encapsulate reusable logic and can return values. Procedures are invoked with CALL and can manage transaction control differently depending on the database. Triggers run automatically in response to INSERT/UPDATE/DELETE events. Useful for auditing, validation, or derived data, but too many triggers can make systems harder to debug.", refs:["https://www.postgresql.org/docs/current/sql-createfunction.html","https://www.postgresql.org/docs/current/sql-createprocedure.html","https://www.postgresql.org/docs/current/sql-createtrigger.html"] },
      { id:"sql17", title:"Pagination — LIMIT/OFFSET vs Keyset", desc:"LIMIT/OFFSET is easy but gets slower on large offsets and can skip/duplicate rows when new data arrives between requests. Keyset pagination uses the last seen sort key, such as WHERE id > ?, which is more stable and index-friendly. For feeds or infinite scroll, keyset is usually the better answer.", refs:["https://www.postgresql.org/docs/current/queries-limit.html"] },
      { id:"sql18", title:"Schema Design for Many-to-Many Relationships", desc:"Many-to-many relationships are modeled with a junction table that stores the foreign keys of both entities, such as student_courses(student_id, course_id). Often the pair should be the primary key or at least unique. Extra relationship attributes like enrolled_at or role belong on the junction table itself.", refs:["https://www.postgresql.org/docs/current/ddl-constraints.html"] },
      { id:"sql19", title:"Date/Time Functions & Time Zone Awareness", desc:"Timestamps, intervals, current time functions, and date truncation show up constantly in analytics and interview questions. Be explicit about whether data is stored in UTC, what the business timezone is, and whether you are grouping by raw timestamps or truncated periods like day or month.", refs:["https://www.postgresql.org/docs/current/datatype-datetime.html","https://www.postgresql.org/docs/current/functions-datetime.html"] },
      { id:"sql20", title:"Execution Plans — Scan, Join, Sort, Filter", desc:"When reading an execution plan, identify the expensive operations first: sequential scans on large tables, bad row estimates, repeated nested loops, large sorts, and filters applied late. Then connect those plan choices back to schema and query design: missing indexes, stale statistics, or non-sargable predicates.", refs:["https://www.postgresql.org/docs/current/using-explain.html"] },
    ]
  },
  {
    id: "devops", label: "DevOps & Cloud", emoji: "☁️", color: "#06B6D4", custom: false,
    topics: [
      { id:"dv1", title:"Containers vs VMs", desc:"VMs: full OS virtualization via hypervisor — complete isolation, slow to start, GBs of overhead. Containers: share host OS kernel, isolated via namespaces + cgroups — start in milliseconds, MBs overhead. Docker creates container images as layered filesystems. Each Dockerfile instruction = one layer (cached).", refs:["https://www.youtube.com/watch?v=cjXI-yenuso"] },
      { id:"dv2", title:"Dockerfile Best Practices", desc:"Multi-stage builds: builder stage (includes build tools) → runtime stage (minimal base image). Reduces image size from GB to MB. Use specific base image versions (not :latest). COPY before RUN for layer caching. CMD vs ENTRYPOINT: CMD provides default args; ENTRYPOINT is the executable. Non-root user for security.", refs:["https://docs.docker.com/develop/develop-images/dockerfile_best-practices/"] },
      { id:"dv3", title:"docker-compose — Multi-Container Apps", desc:"Define services, networks, volumes in YAML. Services share a network by default (refer to each other by service name). Volumes persist data. Environment variables via .env file. depends_on: controls startup order (but not readiness — use healthchecks). Use for local dev; not for production (use K8s or ECS).", refs:["https://docs.docker.com/compose/"] },
      { id:"dv4", title:"Kubernetes — Core Objects", desc:"Pod: smallest deployable unit, 1+ containers sharing network/storage. Deployment: manages pod replicas, rolling updates, rollbacks. ReplicaSet: ensures N pods are always running. Service: stable DNS name + IP for a set of pods (ClusterIP/NodePort/LoadBalancer). Ingress: HTTP routing rules (path/host based).", refs:["https://kubernetes.io/docs/tutorials/kubernetes-basics/","https://www.youtube.com/watch?v=s_o8dwzRlu4"] },
      { id:"dv5", title:"K8s — ConfigMap, Secret, HPA", desc:"ConfigMap: non-sensitive config (env vars, config files). Secret: sensitive data (base64 encoded, not encrypted by default — use Sealed Secrets or Vault). HPA (Horizontal Pod Autoscaler): automatically scales pods based on CPU/memory/custom metrics. Readiness probe: traffic only sent when app is ready. Liveness probe: restart if unhealthy.", refs:["https://kubernetes.io/docs/concepts/configuration/configmap/"] },
      { id:"dv6", title:"K8s — Rolling Updates & StatefulSets", desc:"Rolling update: deploy new pods, wait for readiness, terminate old ones — zero downtime. maxSurge: extra pods during update. maxUnavailable: allowed down pods. StatefulSet: pods get stable network identities (pod-0, pod-1) and persistent storage — for databases. Unlike Deployment, pods are not interchangeable.", refs:["https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment"] },
      { id:"dv7", title:"AWS EC2 & VPC", desc:"EC2: virtual machines. Instance types: t3 (general, burstable), m5 (general purpose), c5 (compute), r5 (memory). Security groups: stateful firewall (allow inbound automatically allows outbound response). VPC: virtual private cloud — subnets (public/private), NAT gateway (private subnet internet access), Internet Gateway, Route tables.", refs:["https://www.youtube.com/watch?v=jZAvKgqlrjY"] },
      { id:"dv8", title:"AWS S3 — Key Features", desc:"Object storage: unlimited objects, up to 5TB each. Presigned URLs: time-limited URLs for private objects. Lifecycle policies: transition to cheaper storage tiers (IA, Glacier) after N days. Versioning: keep all versions of objects. Event notifications: trigger Lambda on s3:PutObject. Cross-region replication for DR.", refs:["https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html"] },
      { id:"dv9", title:"AWS Lambda — Serverless", desc:"Event-driven functions. Cold start: ~100ms-1s on first invocation (container initialization). Warm start: subsequent invocations reuse container. Concurrency: number of simultaneous executions (default limit: 1000 per region). Layers: shared code/dependencies. Provisioned concurrency: pre-warm to eliminate cold starts.", refs:["https://www.youtube.com/watch?v=eOBq__h4OJ4"] },
      { id:"dv10", title:"AWS IAM — Roles & Least Privilege", desc:"IAM: Identity and Access Management. Users: long-term credentials (avoid for applications). Roles: temporary credentials, assumed by services/users. Policies: JSON documents defining allowed/denied actions on resources. Least privilege: grant minimum permissions needed. Service roles: allow EC2/Lambda to call other AWS services.", refs:["https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html"] },
      { id:"dv11", title:"AWS RDS — High Availability", desc:"Multi-AZ: synchronous replication to standby in different AZ, automatic failover (~1-2 min). Read replicas: asynchronous replication for read scaling. Automated backups: daily snapshots + transaction logs (point-in-time recovery). Parameter groups: DB configuration. Enhanced Monitoring: OS-level metrics.", refs:["https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html"] },
      { id:"dv12", title:"GitHub Actions — CI/CD", desc:"Trigger on push/PR/schedule. Jobs run in parallel by default (use needs: for sequencing). Matrix builds: test across multiple Node/Python versions. Secrets: encrypted env vars. Environments: deployment targets with protection rules (require approval). Cache action: cache node_modules between runs. artifacts: share files between jobs.", refs:["https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions"] },
      { id:"dv13", title:"Deployment Strategies", desc:"Blue-Green: two identical environments, switch traffic instantly — easy rollback, expensive (2x infrastructure). Canary: route small % of traffic to new version first, increase if healthy — slow rollback. Rolling: replace instances one by one — slower, mixed versions briefly running. Feature flags: deploy code without activating (LaunchDarkly).", refs:["https://www.youtube.com/watch?v=AWVTKBUnoIg"] },
      { id:"dv14", title:"Observability — Logs, Metrics, Traces", desc:"Logs: structured JSON (include trace_id, user_id). Log levels: DEBUG/INFO/WARN/ERROR. Metrics: counters (request count), gauges (memory usage), histograms (latency distribution). Distributed tracing: trace ID flows across services, spans represent operations. CloudWatch/Prometheus+Grafana/Datadog. SLO: 99.9% success rate. Error budget = 1 - SLO.", refs:["https://www.youtube.com/watch?v=h0GpoEIyMBc"] },
      { id:"dv15", title:"AWS CloudFront & Route53", desc:"CloudFront: CDN with 400+ edge locations. Distributions: origins (S3/ALB/custom), behaviors (cache policies per URL pattern). Cache invalidation via API or versioned file names. Route53: DNS service. Routing policies: Simple, Weighted (A/B test), Latency-based (nearest region), Failover (primary/secondary), Geolocation.", refs:["https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html"] },
      { id:"dv16", title:"AWS SQS & SNS — Messaging", desc:"SQS: message queue. Standard: at-least-once, best-effort order. FIFO: exactly-once, strict order. Visibility timeout: message hidden while processing. Dead Letter Queue for failed messages. SNS: pub/sub. Topic has multiple subscribers (SQS, Lambda, email, HTTP). Fan-out: SNS → multiple SQS queues for parallel processing.", refs:["https://www.youtube.com/watch?v=mXk0MNjlO7A"] },
      { id:"dv17", title:"Infrastructure as Code — Terraform", desc:"Declarative: describe desired state. Providers: AWS, GCP, Azure. Resources: aws_instance, aws_s3_bucket. State file: records current infrastructure (store in S3 + DynamoDB lock for teams). Plan: preview changes. Apply: execute. Modules: reusable components. Import: bring existing resources under Terraform management.", refs:["https://developer.hashicorp.com/terraform/tutorials"] },
      { id:"dv18", title:"AWS API Gateway", desc:"REST API: full-featured, caching, throttling, usage plans. HTTP API: simpler, cheaper, faster (for Lambda/HTTP backends). WebSocket API: for real-time apps. Authorizers: Lambda authorizer (custom auth logic), Cognito user pools, IAM. Throttling: account-level (10K RPS) and per-stage limits. Response caching reduces Lambda invocations.", refs:["https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html"] },
      { id:"dv19", title:"Container Security Best Practices", desc:"Use official minimal base images (alpine, distroless). Run as non-root user (USER 1000). Scan images for vulnerabilities (Trivy, ECR scanning). Don't store secrets in images (use env vars or Secrets Manager). Read-only root filesystem. Resource limits (CPU/memory) prevent one container from starving others. Sign images.", refs:["https://snyk.io/blog/10-docker-image-security-best-practices/"] },
      { id:"dv20", title:"SLO, SLA, SLI & Error Budgets", desc:"SLI (Service Level Indicator): actual measurement (99.95% success rate). SLO (Service Level Objective): internal target (99.9% success). SLA (Service Level Agreement): contractual commitment with consequences. Error budget: 1 - SLO = allowed downtime (0.1% = 8.7 hours/year). Spend error budget on features; when exhausted, freeze deployments.", refs:["https://sre.google/sre-book/service-level-objectives/"] },
      { id:"dv21", title:"AWS ElastiCache & CDN Patterns", desc:"ElastiCache: managed Redis or Memcached. Redis: persistence, pub/sub, richer data structures, clustering. Memcached: simpler, multi-threaded, no persistence. Use ElastiCache for: session storage, leaderboards, real-time analytics, pub/sub. Cache-aside with ElastiCache: application checks cache, falls back to RDS on miss.", refs:["https://aws.amazon.com/elasticache/"] },
      { id:"dv22", title:"Kubernetes Networking", desc:"Every Pod gets a unique IP. Services provide stable IPs/DNS. kube-proxy manages iptables rules. DNS: CoreDNS resolves service-name.namespace.svc.cluster.local. Ingress controller (nginx, Traefik): implements Ingress rules. Network policies: restrict pod-to-pod communication. Service mesh (Istio): mTLS, circuit breaking, observability between services.", refs:["https://kubernetes.io/docs/concepts/services-networking/"] },
      { id:"dv23", title:"CI/CD Best Practices", desc:"Trunk-based development: short-lived feature branches, merge to main daily. Automated tests on every PR (unit + integration). Separate pipelines per environment. Secrets never in code — use CI/CD platform secrets. Immutable artifacts: build once, deploy everywhere. Rollback strategy before every deployment. Zero-downtime deploys.", refs:["https://www.youtube.com/watch?v=ksXpNIo_g8I"] },
      { id:"dv24", title:"Branching Strategies", desc:"GitFlow: main + develop + feature/hotfix branches — good for scheduled releases. Trunk-based: everyone commits to main with feature flags — better for CI/CD and smaller teams. GitHub Flow: main + short-lived feature branches — simple, good for continuous deployment. Choose based on release cadence and team size.", refs:["https://www.atlassian.com/git/tutorials/comparing-workflows"] },
    ]
  },
  {
    id: "ai", label: "AI / LLM", emoji: "🤖", color: "#EC4899", custom: false,
    topics: [
      { id:"ai1", title:"Tokens & Context Windows", desc:"Token ≠ word. 1 token ≈ 4 chars in English. 'Hello world' = 2 tokens. Code and non-English text are less efficient. Context window = max tokens model can 'see' at once (input + output). GPT-4: 128K tokens. Exceeding context: sliding window, summarization, or RAG. Cost = input tokens + output tokens.", refs:["https://platform.openai.com/tokenizer"] },
      { id:"ai2", title:"Embeddings & Cosine Similarity", desc:"Embedding: dense vector representation of text capturing semantic meaning. Similar texts have similar vectors. text-embedding-ada-002: 1536 dimensions. Cosine similarity: angle between vectors (1.0 = identical, 0 = unrelated, -1 = opposite). Used for: semantic search, clustering, RAG retrieval, recommendation systems.", refs:["https://www.youtube.com/watch?v=ySus5ZS0b94"] },
      { id:"ai3", title:"Transformer Architecture — Self-Attention", desc:"Self-attention: each token computes attention scores with every other token — captures long-range dependencies. Query/Key/Value mechanism. Multi-head attention: run attention multiple times with different weight matrices, concatenate results. Positional encoding: adds position information (transformers have no inherent order sense).", refs:["https://jalammar.github.io/illustrated-transformer/","https://www.youtube.com/watch?v=4Bdc55j80l8"] },
      { id:"ai4", title:"Fine-tuning vs RAG vs Prompting", desc:"Prompt engineering: no training, fast, no data needed — best for format/style changes. RAG: inject relevant docs at query time — best for factual Q&A over private/recent data. Fine-tuning: train model on your data — best for consistent style/behavior/domain language. Cost: prompting < RAG < fine-tuning. RAG is usually the right choice first.", refs:["https://www.youtube.com/watch?v=ahnGLM-RC1Y"] },
      { id:"ai5", title:"RAG Pipeline — End to End", desc:"Ingestion: load documents → split into chunks → embed each chunk → store in vector DB. Retrieval: embed user query → similarity search in vector DB → retrieve top-k chunks. Generation: inject retrieved chunks into LLM prompt as context → LLM generates answer. Key tuning: chunk size, overlap, k, similarity threshold.", refs:["https://www.youtube.com/watch?v=qN_2fnOPY-M"] },
      { id:"ai6", title:"Chunking Strategies", desc:"Fixed-size: split by token count with overlap — simple, ignores semantics. Sentence: split on sentence boundaries — better semantic units. Semantic: embed sentences, group by similarity — best quality, slowest. Recursive character splitting: split by paragraphs → sentences → words — good default. Overlap (10-20%) prevents missing context at boundaries.", refs:["https://www.pinecone.io/learn/chunking-strategies/"] },
      { id:"ai7", title:"Vector Databases", desc:"pgvector: Postgres extension — cosine/L2/dot product. Good if already using PG. Pinecone: managed, scalable, purpose-built. Qdrant: open-source, filtering on metadata. Chroma: local dev, in-memory or SQLite. Weaviate: graph + vector. Key operations: upsert (insert/update), query (top-k), filter by metadata.", refs:["https://www.youtube.com/watch?v=klTvEwg3oJ4"] },
      { id:"ai8", title:"Retrieval — Dense, Sparse & Hybrid", desc:"Dense retrieval: semantic similarity via embeddings — finds conceptually similar text even with different words. Sparse retrieval (BM25): keyword matching — exact term frequency. Hybrid: combine both scores (Reciprocal Rank Fusion). Reranking: use a cross-encoder model to re-score top-k results — slow but accurate.", refs:["https://www.pinecone.io/learn/hybrid-search-intro/"] },
      { id:"ai9", title:"LangChain — Chains, Memory, Retrievers", desc:"LCEL (LangChain Expression Language): compose chains with | operator. Retrievers: abstract vector store lookup. Memory: ConversationBufferMemory (all history), ConversationSummaryMemory (compressed). ConversationalRetrievalChain: history-aware RAG. Callbacks: logging and tracing. LangSmith: observability platform for LLM apps.", refs:["https://python.langchain.com/docs/get_started/introduction"] },
      { id:"ai10", title:"LangGraph — Stateful Agents", desc:"LangGraph: builds stateful multi-actor applications as graphs. Node: a function that modifies state. Edge: connects nodes. Conditional edge: route based on state. Cycles allowed (unlike DAGs) — enables agent loops. StateGraph: shared state dict passed between nodes. Human-in-the-loop: interrupt() pauses for human input.", refs:["https://langchain-ai.github.io/langgraph/tutorials/introduction/"] },
      { id:"ai11", title:"Agents — ReAct & Tool Use", desc:"ReAct (Reasoning + Acting): model alternates Thought → Action → Observation until it has an answer. Tool use: model outputs structured tool call (name + args), runtime executes it, result returned to model. OpenAI function calling: define tools as JSON Schema, model decides when to call them. Agents can hallucinate tool calls.", refs:["https://www.youtube.com/watch?v=Tg7GjX5P0po"] },
      { id:"ai12", title:"Prompt Engineering Techniques", desc:"Zero-shot: direct instruction. Few-shot: provide 2-5 examples — dramatically improves structured output. Chain-of-thought (CoT): 'Think step by step' — improves reasoning. System prompt: sets behavior context. JSON mode: constrain output to valid JSON. Temperature 0: deterministic (good for tasks with right answers). Higher temp: creative.", refs:["https://www.promptingguide.ai/"] },
      { id:"ai13", title:"RAGAS — LLM Evaluation", desc:"Faithfulness: does answer only use information from retrieved context? (hallucination check). Answer Relevance: does the answer address the question? Context Recall: did retrieval find the right information? Context Precision: were the retrieved chunks actually useful? LLM-as-judge: use GPT-4 to score outputs. Build eval datasets from real user queries.", refs:["https://docs.ragas.io/en/stable/concepts/metrics/index.html"] },
      { id:"ai14", title:"Agentic AI — Patterns & Risks", desc:"Patterns: single-agent, multi-agent (orchestrator + specialists), hierarchical. MCP (Model Context Protocol): Anthropic standard for connecting LLMs to external tools/data. Risks: infinite loops (add iteration limits), irreversible actions (add confirmation steps), cascading errors in multi-agent. Evals critical — test failure modes explicitly.", refs:["https://www.anthropic.com/news/model-context-protocol"] },
      { id:"ai15", title:"OpenAI API — Key Features", desc:"Chat completions: messages array with role (system/user/assistant). Streaming: receive tokens as generated (stream=True). Function calling: tools parameter with JSON Schema definitions. Embeddings: text-embedding-3-small/large. Structured outputs: response_format with JSON Schema — guaranteed valid JSON. Batch API: 50% discount for async jobs.", refs:["https://platform.openai.com/docs/guides/text-generation"] },
      { id:"ai16", title:"Hallucination Mitigation", desc:"RAG grounds answers in retrieved facts. Prompt: 'If you don't know, say so. Only use information from the provided context.' Temperature 0 for factual tasks. Faithfulness check with RAGAS. Citation: ask model to cite which part of context supports each claim. Self-consistency: run multiple times and take majority answer.", refs:["https://www.youtube.com/watch?v=QKyv0nkLcHU"] },
      { id:"ai17", title:"LLM Cost Optimization", desc:"Cache common queries — avoid re-running identical prompts. Use smaller models for simple tasks (GPT-4o-mini vs GPT-4o: 50-100x cheaper). Prompt compression: remove redundant context. Batch API: 50% off for non-real-time jobs. Track token usage per feature to identify expensive flows. Streaming reduces perceived latency.", refs:["https://platform.openai.com/docs/guides/latency-optimization"] },
      { id:"ai18", title:"Function Calling & Structured Outputs", desc:"Function calling: define tool schemas in tools parameter. Model outputs tool_call with name + arguments (JSON). Your code executes the function, return result as tool message. Parallel tool calls: model can call multiple tools simultaneously. Structured outputs (response_format): guarantee valid JSON matching your schema — no parsing errors.", refs:["https://platform.openai.com/docs/guides/function-calling"] },
      { id:"ai19", title:"Prompt Injection & Security", desc:"Prompt injection: user input that attempts to override system instructions. Example: 'Ignore previous instructions and...' Defenses: input validation, output parsing (don't execute model output directly), separate untrusted content clearly, use structured outputs instead of free-form text for sensitive operations.", refs:["https://www.youtube.com/watch?v=l-_yHo2Z3F4"] },
      { id:"ai20", title:"Temperature, Top-p & Sampling", desc:"Temperature: controls randomness. 0 = deterministic (always highest probability token). 1 = sampling from distribution. >1 = more random. Top-p (nucleus sampling): only sample from tokens whose cumulative probability reaches p. Top-k: only sample from top-k tokens. For factual tasks: temp=0. For creative: temp=0.7-1.0.", refs:["https://www.youtube.com/watch?v=YjVuJjmlaVA"] },
      { id:"ai21", title:"GPT vs BERT — Decoder vs Encoder", desc:"BERT: encoder-only transformer. Trained with masked language modeling. Bidirectional context. Great for understanding tasks: classification, NER, semantic similarity. GPT: decoder-only transformer. Trained with next-token prediction. Unidirectional (left to right). Great for generation. T5/BART: encoder-decoder — good for seq2seq (translation, summarization).", refs:["https://jalammar.github.io/illustrated-bert/"] },
      { id:"ai22", title:"LangSmith & Observability", desc:"LangSmith: LangChain's observability platform. Trace every LLM call: inputs, outputs, latency, tokens. Debug multi-step chains by inspecting each node. Create datasets from traced runs. Run automated evals on datasets. Monitor production: track error rates, latency, cost. Essential for production LLM apps.", refs:["https://docs.smith.langchain.com/"] },
      { id:"ai23", title:"MCP — Model Context Protocol", desc:"Open standard by Anthropic for connecting LLMs to external data/tools. MCP Server: exposes resources (data sources) and tools (actions) via a standard protocol. MCP Client: the LLM app that connects to servers. Benefits: reusable integrations, consistent interface, community ecosystem. Alternative to custom tool implementations.", refs:["https://modelcontextprotocol.io/introduction"] },
    ]
  },
  {
    id: "sec", label: "Security", emoji: "🔒", color: "#EF4444", custom: false,
    topics: [
      { id:"s1", title:"XSS — Cross-Site Scripting", desc:"Stored XSS: malicious script saved in DB, served to all users. Reflected XSS: script in URL parameter, reflected back. DOM-based: script manipulates DOM directly. Prevention: escape HTML output (never innerHTML with user data), Content Security Policy (CSP), HttpOnly cookies, DOMPurify for sanitizing HTML.", refs:["https://owasp.org/www-community/attacks/xss/"] },
      { id:"s2", title:"CSRF — Cross-Site Request Forgery", desc:"Attacker tricks logged-in user's browser to make unauthorized request. Browser automatically sends cookies. Defense: CSRF tokens (server generates, form submits, server validates), SameSite=Strict/Lax cookie attribute. SameSite=Strict: cookie never sent cross-site. Origin/Referer header checking as secondary defense.", refs:["https://owasp.org/www-community/attacks/csrf"] },
      { id:"s3", title:"SQL Injection", desc:"Attacker injects SQL through user input: ' OR '1'='1 in login form. Bypasses auth, dumps data, drops tables. Prevention: parameterized queries / prepared statements (ALWAYS), ORM (abstracts SQL), least privilege DB user. Never concatenate user input into SQL strings. Input validation as secondary defense.", refs:["https://portswigger.net/web-security/sql-injection"] },
      { id:"s4", title:"OWASP Top 10", desc:"2021: 1) Broken Access Control, 2) Cryptographic Failures, 3) Injection, 4) Insecure Design, 5) Security Misconfiguration, 6) Vulnerable & Outdated Components, 7) Identification & Auth Failures, 8) Software & Data Integrity Failures, 9) Security Logging & Monitoring Failures, 10) SSRF.", refs:["https://owasp.org/www-project-top-ten/"] },
      { id:"s5", title:"Password Storage — bcrypt & argon2", desc:"Never store plaintext or MD5/SHA1 (fast = bad for passwords). bcrypt: adaptive cost factor, built-in salt, slow by design. argon2: winner of Password Hashing Competition, memory-hard (resists GPU attacks), 3 variants (argon2id recommended). Salt: random value added before hashing — prevents rainbow tables. Work factor: increase as hardware improves.", refs:["https://www.youtube.com/watch?v=zt8Cocdy15w"] },
      { id:"s6", title:"JWT Security — Common Attacks", desc:"Algorithm confusion attack: change alg to 'none' in header — server skips signature verification if not enforced. Weak secret brute force: JWT signed with 'secret' or 'password'. Fix: enforce algorithm server-side, use strong random secret (256+ bits). Never decode without verifying. JWT expiry (exp claim) not magic — check it.", refs:["https://portswigger.net/web-security/jwt"] },
      { id:"s7", title:"Encryption — AES & RSA", desc:"AES (symmetric): same key encrypt/decrypt. AES-256-GCM: authenticated encryption (also provides integrity). Fast for large data. RSA (asymmetric): public key encrypts, private key decrypts. Slow — only use for small data or key exchange. Hybrid: RSA encrypts AES key, AES encrypts data. This is what TLS does.", refs:["https://www.youtube.com/watch?v=AQDCe585Lnc"] },
      { id:"s8", title:"Security Headers", desc:"Content-Security-Policy: restrict resource origins — prevents XSS. HSTS: force HTTPS (Strict-Transport-Security: max-age=31536000). X-Frame-Options: DENY — prevents clickjacking. X-Content-Type-Options: nosniff — prevents MIME sniffing. Referrer-Policy: controls Referer header. Permissions-Policy: disables browser features (camera, geolocation).", refs:["https://securityheaders.com/"] },
      { id:"s9", title:"SSRF, IDOR & Other Vulnerabilities", desc:"SSRF (Server-Side Request Forgery): attacker makes server fetch internal URLs (http://169.254.169.254/ for AWS metadata). Prevention: whitelist allowed hosts, block private IP ranges. IDOR (Insecure Direct Object Reference): /api/users/123 — can user 456 access this? Always check ownership. Mass assignment: automatically binding request body to model — whitelist allowed fields.", refs:["https://portswigger.net/web-security/ssrf"] },
      { id:"s10", title:"Secrets Management", desc:"Never commit secrets to git (use git-secrets, .gitignore). Environment variables for config. AWS Secrets Manager: store, rotate, audit secrets. SSM Parameter Store: simpler, cheaper. Vault (HashiCorp): comprehensive secrets management. Docker: use Docker secrets or env files not baked into images. Rotate secrets regularly.", refs:["https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html"] },
      { id:"s11", title:"OAuth2 Security — PKCE & State Param", desc:"State parameter: random value in auth request, verified on callback — prevents CSRF on OAuth flow. PKCE (Proof Key for Code Exchange): code_verifier (random string) → code_challenge (hash) sent in auth request. On token exchange, send code_verifier — server verifies hash matches. Prevents authorization code interception.", refs:["https://portswigger.net/web-security/oauth"] },
      { id:"s12", title:"Hashing vs Encryption", desc:"Hashing: one-way, deterministic, fixed output size. Use for: passwords, data integrity (checksums), digital signatures. Encryption: reversible with key. Use for: storing data you need to retrieve (payment info, PII). Digital signature: hash the data, encrypt hash with private key. Recipient decrypts with public key, compares hashes.", refs:["https://www.youtube.com/watch?v=GI790E1JMgw"] },
      { id:"s13", title:"HTTPS Certificate Pinning & mTLS", desc:"Certificate pinning: client hard-codes expected cert or public key hash — rejects connections with different certs even if signed by trusted CA. Prevents rogue CA attacks. mTLS (mutual TLS): both client AND server present certificates. Server verifies client's identity. Used for service-to-service communication in zero-trust architectures.", refs:["https://www.youtube.com/watch?v=r1nJT63BFQ0"] },
      { id:"s14", title:"Brute Force Protection & MFA", desc:"Account lockout after N failed attempts (risk: DoS by locking legitimate users). Rate limiting: N attempts per IP per window. CAPTCHA: proves human. MFA (Multi-Factor Authentication): TOTP (time-based OTP — Google Authenticator, RFC 6238), SMS (insecure — SIM swap), WebAuthn/FIDO2 (hardware key, biometric — most secure).", refs:["https://www.youtube.com/watch?v=ZXFYT-BG2So"] },
      { id:"s15", title:"Input Validation & Output Encoding", desc:"Validate on server side (never trust client). Whitelist allowed characters/formats. Reject invalid input early. Output encoding: HTML encode when outputting to HTML, URL encode for URLs, JSON encode for JSON. Different contexts need different encoding — a single 'sanitize' function is never enough.", refs:["https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html"] },
      { id:"s16", title:"Dependency Security & Supply Chain", desc:"Regularly audit dependencies: npm audit, pip-audit. Lock files (package-lock.json): ensure reproducible builds. Snyk/Dependabot: automated vulnerability scanning. Typosquatting: installing 'lodash' vs 'l0dash'. Verify package authors. Software Bill of Materials (SBOM): inventory of all components. Signed commits and images.", refs:["https://snyk.io/learn/open-source-security/"] },
    ]
  },
  {
    id: "dsa", label: "DSA", emoji: "🧮", color: "#64748B", custom: false,
    topics: [
      { id:"dsa1", title:"Big O — Time & Space Complexity", desc:"Describes growth rate, not exact time. Drop constants and lower-order terms. O(1): hash lookup. O(log n): binary search. O(n): single loop. O(n log n): merge sort. O(n²): nested loops. O(2ⁿ): brute force recursion (subsets). Space: count extra memory used. Recursive calls use O(depth) stack space.", refs:["https://www.youtube.com/watch?v=D6xkbGLQesk","https://neetcode.io/courses/dsa-for-beginners/0"] },
      { id:"dsa2", title:"Arrays & HashMaps — The Core Duo", desc:"Array: O(1) access, O(n) insert/delete in middle. HashMap: O(1) average for get/put/delete. The fundamental optimization: trade O(n) space for O(n) time savings — reduces nested loops from O(n²) to O(n). Collision resolution: chaining (linked list) or open addressing (probing). Load factor > 0.75 triggers resize.", refs:["https://neetcode.io/courses/dsa-for-beginners/5"] },
      { id:"dsa3", title:"Linked Lists", desc:"Singly: each node has value + next pointer. O(n) access, O(1) insert/delete at known node. No random access. Use when: frequent insert/delete at front, don't need random access. Doubly linked: also has prev pointer — easier to delete a node. Common patterns: runner technique (slow/fast pointers), reversing in-place.", refs:["https://neetcode.io/courses/dsa-for-beginners/6"] },
      { id:"dsa4", title:"Stack & Monotonic Stack", desc:"LIFO. O(1) push/pop/peek. Uses: balanced brackets, undo functionality, DFS. Monotonic stack: maintain stack in increasing/decreasing order — when pushing, pop elements that violate order. Use for: next greater element, largest rectangle in histogram, daily temperatures. O(n) amortized — each element pushed/popped once.", refs:["https://www.youtube.com/watch?v=Dq_ObZwTY_Q"] },
      { id:"dsa5", title:"Heap / Priority Queue", desc:"Complete binary tree stored as array. Min-heap: parent ≤ children (root = minimum). Max-heap: parent ≥ children. heapify: O(n). insert: O(log n). extract-min/max: O(log n). Use for: top-k elements, merge k sorted lists, median of stream, Dijkstra's algorithm. Python heapq: min-heap by default.", refs:["https://neetcode.io/courses/dsa-for-beginners/13"] },
      { id:"dsa6", title:"Pattern: Two Pointers", desc:"Use two indices, usually moving toward each other or in the same direction. Eliminates nested loops → O(n). Requires sorted array or specific structure. Classic: Two Sum II, Container With Most Water, 3Sum. Template: left=0, right=n-1, while left<right: check condition, move appropriate pointer.", refs:["https://neetcode.io/courses/dsa-for-beginners/23"] },
      { id:"dsa7", title:"Pattern: Sliding Window", desc:"Maintain a window [left, right] over an array/string. Expand right to grow window, shrink left when condition violated. Variable size: find max/min window satisfying condition. Fixed size: maintain window of exactly k elements. Key insight: each element is added and removed at most once → O(n). Use HashMap for character counts.", refs:["https://neetcode.io/courses/dsa-for-beginners/24"] },
      { id:"dsa8", title:"Pattern: Binary Search", desc:"Works on sorted array. Template: lo=0, hi=n-1, while lo<=hi: mid=(lo+hi)//2, compare target with arr[mid]. Key insight: binary search works on any monotonic function — 'search on answer space'. Examples: find minimum rotated array, Koko eating bananas, capacity to ship packages. Always think about what invariant is maintained.", refs:["https://neetcode.io/courses/dsa-for-beginners/22"] },
      { id:"dsa9", title:"Trees — BFS & DFS", desc:"DFS: traverse deep first (recursion or explicit stack). Inorder (left-node-right): gives sorted output for BST. Preorder (node-left-right): serialize tree. Postorder (left-right-node): delete tree, calculate subtree values. BFS: level by level using queue. Use for shortest path in unweighted tree, level-order traversal.", refs:["https://neetcode.io/courses/dsa-for-beginners/16"] },
      { id:"dsa10", title:"BST — Properties & Operations", desc:"Left subtree values < node < right subtree values. Search/insert/delete: O(log n) balanced, O(n) worst case. Inorder traversal gives sorted array. Validate BST: pass min/max bounds down the tree (not just checking parent). Common operations: find kth smallest (inorder), LCA (lowest common ancestor), serialize/deserialize.", refs:["https://neetcode.io/courses/dsa-for-beginners/17"] },
      { id:"dsa11", title:"Graphs — BFS & DFS", desc:"Adjacency list: {node: [neighbors]}. BFS with queue: explores level by level — shortest path in unweighted graphs. DFS with recursion/stack: explores as far as possible. Both: O(V+E). Key: visited set to avoid cycles. Grid problems: treat cells as nodes, 4/8 directions as edges. Common: Number of Islands, Clone Graph.", refs:["https://neetcode.io/courses/dsa-for-beginners/19"] },
      { id:"dsa12", title:"Topological Sort & Cycle Detection", desc:"Topological sort: linear ordering of nodes where each comes before its dependencies. Only for DAGs (directed acyclic graphs). Kahn's algorithm (BFS): start with nodes having in-degree 0, process and reduce neighbors' in-degree. DFS-based: run DFS, add to result stack on backtrack. Cycle detection: if nodes remain unprocessed → cycle exists.", refs:["https://www.youtube.com/watch?v=Q9PIxaNGnig"] },
      { id:"dsa13", title:"Union-Find (DSU)", desc:"Efficiently tracks which elements are in the same connected component. find(x): returns root of x's component. union(x,y): merges components. Path compression: make every node point directly to root — near O(1). Union by rank: attach smaller tree under larger. Use for: detecting cycles, Kruskal's MST, number of connected components.", refs:["https://www.youtube.com/watch?v=ayW5B2W9hkk"] },
      { id:"dsa14", title:"Dynamic Programming — 1D", desc:"DP = recursion + memoization. Three steps: 1) Define the subproblem (what does dp[i] represent?). 2) Write the recurrence relation. 3) Identify base cases. Convert top-down (memo) to bottom-up (tabulation). Classic 1D: Fibonacci, Climbing Stairs, House Robber, Longest Increasing Subsequence, Coin Change.", refs:["https://neetcode.io/courses/dsa-for-beginners/27","https://www.youtube.com/watch?v=oBt53YbR9Kk"] },
      { id:"dsa15", title:"Dynamic Programming — 2D", desc:"dp[i][j] represents subproblem using first i items of sequence 1 and first j of sequence 2. LCS: dp[i][j] = dp[i-1][j-1]+1 if match, else max(dp[i-1][j], dp[i][j-1]). Edit Distance: dp[i][j] = min(insert, delete, replace). 0/1 Knapsack: include or exclude item. Grid paths: sum paths to reach each cell.", refs:["https://www.youtube.com/watch?v=oBt53YbR9Kk"] },
      { id:"dsa16", title:"Backtracking", desc:"Systematic exploration of all possibilities by building solutions incrementally and abandoning partial solutions (pruning) when they can't lead to valid answers. Template: if valid solution → record it. For each choice: make choice → recurse → undo choice. Use for: subsets, permutations, combinations, N-Queens, Sudoku.", refs:["https://neetcode.io/courses/dsa-for-beginners/25"] },
      { id:"dsa17", title:"Greedy Algorithms", desc:"Make locally optimal choice at each step hoping for global optimum. Works when: greedy choice property (local best leads to global best) and optimal substructure. Classic: Activity Selection (sort by end time), Huffman Coding, Dijkstra (greedy on shortest distance). Doesn't work for 0/1 Knapsack — use DP.", refs:["https://www.youtube.com/watch?v=bC7o8P_Ste4"] },
      { id:"dsa18", title:"Sorting Algorithms", desc:"Merge sort: divide and conquer, O(n log n) stable, O(n) space. Quick sort: partition around pivot, O(n log n) avg, O(n²) worst, O(log n) space in-place. Heap sort: O(n log n), in-place, not stable. Counting sort: O(n+k), only for integers in known range. Timsort (Python/Java built-in): hybrid merge+insertion sort.", refs:["https://www.youtube.com/watch?v=kgBjXUE_Nwc"] },
      { id:"dsa19", title:"Trie (Prefix Tree)", desc:"Tree where each path from root to node spells a string. Each node has up to 26 children (for lowercase letters). Insert/search: O(m) where m = word length. Use for: autocomplete, spell check, IP routing. TrieNode: children dict + is_end_of_word boolean. Compressed trie (Radix tree): merge single-child paths.", refs:["https://neetcode.io/courses/dsa-for-beginners/18"] },
      { id:"dsa20", title:"Prefix Sums", desc:"Precompute cumulative sum array where prefix[i] = sum of arr[0..i]. Range sum query O(1): sum(l,r) = prefix[r] - prefix[l-1]. 2D prefix sums for matrix range queries. Combine with hashmap: store prefix sums seen so far to find subarrays with target sum in O(n). Key insight: subarray sum = prefix[j] - prefix[i].", refs:["https://www.youtube.com/watch?v=7pJo_rM0z_s"] },
      { id:"dsa21", title:"Intervals", desc:"Sort by start time first. Merge overlapping: if current.start <= prev.end, merge (update prev.end = max). Insert interval: find correct position, merge with neighbors. Meeting rooms: check if any intervals overlap. Non-overlapping intervals (greedy): sort by end, greedily select intervals that don't conflict.", refs:["https://www.youtube.com/watch?v=44H3cEC2fFM"] },
      { id:"dsa22", title:"Bit Manipulation", desc:"AND (&): 1 only if both 1. OR (|): 1 if either 1. XOR (^): 1 if different (same numbers cancel: n^n=0). NOT (~). Left shift (<<): multiply by 2. Right shift (>>): divide by 2. Check bit k: n & (1<<k). Set bit k: n | (1<<k). Count set bits: Brian Kernighan's algorithm: n &= (n-1) removes lowest set bit.", refs:["https://www.youtube.com/watch?v=NLKQEOgBAnw"] },
      { id:"dsa23", title:"Heap Patterns — Top-K Problems", desc:"Top-k largest: use min-heap of size k. For each new element > heap[0], pop min and push new. Result: heap contains k largest. Top-k smallest: use max-heap of size k. Kth largest in stream: maintain min-heap of size k, return heap[0]. Merge k sorted lists: min-heap with (value, list_index, element_index).", refs:["https://www.youtube.com/watch?v=5ARFl-dPaQk"] },
      { id:"dsa24", title:"Graph — Advanced: Dijkstra & Bellman-Ford", desc:"Dijkstra: shortest path from source to all nodes. Uses min-heap. O((V+E) log V). Doesn't work with negative edges. Bellman-Ford: O(VE), works with negative edges, detects negative cycles. Floyd-Warshall: all-pairs shortest path O(V³). Prim's/Kruskal's: minimum spanning tree.", refs:["https://www.youtube.com/watch?v=XB4MIexjvY0"] },
    ]
  },
  {
    id: "sd", label: "System Design", emoji: "🏛️", color: "#6366F1", custom: false,
    topics: [
      { id:"sd1", title:"Scalability — Vertical vs Horizontal", desc:"Vertical: bigger machine (more CPU/RAM). Fast to implement, no code changes, hard ceiling, single point of failure. Horizontal: more machines. Requires stateless services (session in Redis, not memory), load balancer, distributed data. Start vertical, go horizontal when needed. Premature horizontal scaling is a common mistake.", refs:["https://www.youtube.com/watch?v=-W9F__D3oY4"] },
      { id:"sd2", title:"Load Balancing — Algorithms & Types", desc:"Round Robin: distribute equally. Least Connections: send to least busy server. IP Hash: consistent routing (sticky sessions without server-side storage). Weighted: assign more traffic to powerful servers. L4 (TCP level): fast, no content inspection. L7 (HTTP level): path/header routing, more flexible. Health checks: remove unhealthy servers.", refs:["https://www.youtube.com/watch?v=sCR3SAVdyCc"] },
      { id:"sd3", title:"API Gateway Pattern", desc:"Single entry point for all clients. Handles: authentication, rate limiting, SSL termination, request routing, load balancing, caching, request/response transformation, API versioning. Benefits: clients don't need to know about internal services. Drawback: another service to maintain, potential bottleneck. Examples: AWS API Gateway, Kong, nginx.", refs:["https://www.youtube.com/watch?v=6ULyxuHKxg8"] },
      { id:"sd4", title:"Rate Limiting — System Design", desc:"Implement at API Gateway level. Token bucket in Redis: key=user_id:window, INCR + EXPIRE in single Lua script (atomic). Global vs per-user limits. Returning 429 with Retry-After header. Soft limits (throttle) vs hard limits (block). Distributed rate limiting: Redis atomic operations prevent race conditions across multiple API servers.", refs:["https://www.youtube.com/watch?v=FU4WlwfS3G0"] },
      { id:"sd5", title:"CAP Theorem — Real Decisions", desc:"During network partition: choose consistency (refuse to serve stale data, return error) or availability (serve potentially stale data). CP examples: bank account balance, inventory count, distributed lock. AP examples: social media feed, product recommendations, DNS. Most modern systems are tunable — DynamoDB, Cassandra offer both modes.", refs:["https://www.youtube.com/watch?v=BHqjEjzAicA"] },
      { id:"sd6", title:"Caching in System Design", desc:"Where to cache: CDN (static assets), API response cache (full response), application cache (computed results), DB query cache. Cache invalidation: TTL (simple), event-driven (on data change), cache-aside (lazy). Hot key problem: one key gets enormous traffic — local cache + jitter on TTL, replicate hot keys. Never cache mutable user-specific data at CDN.", refs:["https://www.youtube.com/watch?v=dGAgxozNWFE"] },
      { id:"sd7", title:"Kafka — Architecture & Use Cases", desc:"Distributed event streaming. Topic: category of messages. Partition: ordered, immutable log within topic. Consumer group: multiple consumers share partitions (parallelism). Offset: consumer tracks its position. Retention: messages kept for days (replay). Use for: event sourcing, activity tracking, metrics pipeline, microservice integration. Not for: RPC, simple task queues.", refs:["https://www.youtube.com/watch?v=Ch5VhJzaoaI"] },
      { id:"sd8", title:"Microservices vs Monolith", desc:"Monolith: single deployable unit. Pros: simple, no network overhead, easy debugging, strong consistency. Cons: deployment coupling, scaling limits. Microservices: independent services with own DB. Pros: independent scaling/deployment. Cons: distributed system complexity (latency, partial failures, eventual consistency). Start monolith, extract services when pain is real.", refs:["https://www.youtube.com/watch?v=rv4LlmLmVWk"] },
      { id:"sd9", title:"Circuit Breaker Pattern", desc:"Prevents cascade failures in distributed systems. States: Closed (normal, requests flow through) → Open (after N failures, fail fast without calling service) → Half-Open (probe if service recovered with one request). Resilience4j in Java/Spring. Benefits: fast failure, allows downstream service to recover. Configure: failure threshold, wait duration, half-open requests.", refs:["https://www.youtube.com/watch?v=ADHcBxEXvFA"] },
      { id:"sd10", title:"Saga Pattern — Distributed Transactions", desc:"Replace distributed ACID transactions with a series of local transactions, each publishing an event. Choreography: each service reacts to events — decoupled, harder to debug. Orchestration: central coordinator tells each service what to do — easier to reason about. Compensating transactions rollback on failure. Two-phase commit as an alternative (but blocking).", refs:["https://microservices.io/patterns/data/saga.html"] },
      { id:"sd11", title:"Design: URL Shortener", desc:"Functional: shorten URL, redirect. Non-functional: low latency reads (cached), 100M URLs. Storage: hash(longUrl) → 7-char base62 string (62^7 = 3.5 trillion). DB: URL table (short_code, long_url, user_id, created_at). Redis cache for reads. Write: generate code, check collision, store. Read: Redis hit → return; Redis miss → DB → cache → return.", refs:["https://www.youtube.com/watch?v=fMZMm_0ZhK4"] },
      { id:"sd12", title:"Design: Chat Application", desc:"Real-time: WebSocket connection per client. Message flow: sender → server → recipient's WebSocket. Offline: store in DB, deliver on reconnect. Group chat: fan-out to all members. Message ordering: sequence numbers per conversation. Storage: messages table indexed by conversation_id + created_at. Scale: consistent hashing to assign users to chat servers.", refs:["https://www.youtube.com/watch?v=vvhC64hQZMk"] },
      { id:"sd13", title:"Design: News Feed (Twitter/Instagram)", desc:"Fan-out on write: when user posts, push to all followers' feed tables. Fast reads, slow writes, huge storage for celebrity users. Fan-out on read: compute feed at read time by merging followed users' posts. Slow reads, no storage overhead. Hybrid: push for normal users, pull for celebrities (100M+ followers). Redis sorted set for feed storage.", refs:["https://www.youtube.com/watch?v=QmX2NPkJTKg"] },
      { id:"sd14", title:"Design: Notification System", desc:"Components: event producers (triggers), notification service, priority queues (critical vs non-critical), delivery workers per channel (push/SMS/email). Rate limiting: max N notifications per user per hour. Template service: notification templates with user data. Retry + dead letter queue. Delivery tracking. User preference service (opt-out).", refs:["https://www.youtube.com/watch?v=bBTPZ9NdSk8"] },
      { id:"sd15", title:"Design: Rate Limiter (System)", desc:"In-process: fast but doesn't work across multiple servers. Distributed: Redis with atomic Lua script. Token bucket implementation: HGET token count → if enough: DECRBY + return allowed; else: return denied. Sliding window log: store timestamps in Redis sorted set, count within window. Fixed window: simpler but burst problem at boundary.", refs:["https://www.youtube.com/watch?v=FU4WlwfS3G0"] },
      { id:"sd16", title:"Design: Key-Value Store", desc:"Operations: get(key), put(key, value), delete(key). Single node: hash map in memory + write-ahead log for persistence. Distributed: consistent hashing for partitioning, replication factor N (store on N nodes), quorum reads/writes (W + R > N for strong consistency). Conflict resolution: last-write-wins (timestamp) or vector clocks.", refs:["https://www.youtube.com/watch?v=rnZmdmlR-2M"] },
      { id:"sd17", title:"Design: Search Autocomplete", desc:"Trie-based: each node stores top-k queries for its prefix. Update trie with query frequency. Cache top prefixes. Scale: shard trie by first 2 chars, replica for read. Offline aggregation: batch update trie from query logs. Response: return top 5 suggestions for prefix. Debounce client requests (send after 300ms of no typing).", refs:["https://www.youtube.com/watch?v=us0qySiUsGU"] },
      { id:"sd18", title:"Design: Video Streaming (YouTube/Netflix)", desc:"Upload: chunked upload to S3, job queue → transcoding workers → multiple resolutions → CDN. Metadata: video DB (title, user, views, status). Streaming: range requests, HLS/DASH adaptive bitrate (automatically adjusts quality to bandwidth). CDN: cache popular videos at edge. Thumbnail generation. View count: Redis counter + async DB sync.", refs:["https://www.youtube.com/watch?v=jPKTo1iGQiE"] },
      { id:"sd19", title:"Design: Distributed Cache (Redis)", desc:"Consistent hashing: distribute keys across cache nodes. Replication: primary + replicas for read scaling and failover. Cluster mode: auto-sharding. Eviction: LRU (evict least recently used) when memory full. Persistence: RDB (periodic snapshots) vs AOF (append-only log of every command). Client-side caching: clients cache keys locally.", refs:["https://www.youtube.com/watch?v=iuqZvajTOyA"] },
      { id:"sd20", title:"Design: Ride-Sharing ETA Service", desc:"Your LeaveNow project! Location service: store driver locations in Redis geospatial index (GEOADD, GEORADIUS). Matching: find nearest K drivers. Route calculation: Dijkstra's on road graph, or OSRM/Google Maps API. ETA: ML model trained on historical travel times by time-of-day. Surge pricing: demand/supply ratio per hexagonal zone.", refs:["https://www.youtube.com/watch?v=AylZS9UIYrU"] },
      { id:"sd21", title:"Consistency Patterns", desc:"Strong consistency: after write, all reads return new value. Requires synchronous replication. Eventual consistency: replicas catch up eventually. Read-your-writes: you always see your own writes (route your reads to primary for a window). Monotonic reads: once you see a value, never see older value (sticky sessions to same replica).", refs:["https://www.youtube.com/watch?v=m4q7VkgDWrM"] },
      { id:"sd22", title:"Distributed Tracing & Service Mesh", desc:"Distributed tracing: trace_id propagated via HTTP headers across all services. Each service creates a span. Spans form a tree showing the full request path. Tools: Jaeger, Zipkin, AWS X-Ray. Service mesh (Istio/Linkerd): sidecar proxy handles mTLS, load balancing, circuit breaking, observability — zero code changes needed.", refs:["https://www.jaegertracing.io/docs/1.21/"] },
      { id:"sd23", title:"Message Queue Patterns", desc:"Point-to-point: one consumer per message (SQS). Pub/Sub: multiple consumers per message (SNS, Kafka). At-least-once: message may be delivered multiple times — consumers must be idempotent. Exactly-once: Kafka with transactions, expensive. Outbox pattern: write event to outbox table in same DB transaction as business data, then relay to queue.", refs:["https://www.youtube.com/watch?v=oUJbuFMyFDg"] },
      { id:"sd24", title:"RESHADED Framework", desc:"Requirements (functional + non-functional) → Estimation (DAU, QPS, storage) → Storage (schema design) → High-Level Design (core components) → APIs (key endpoints) → Data Flow (walk through core use case) → Extras (queues, search, async) → Deep Dives (bottlenecks, failure cases, scaling). Use this sequence in every SD interview.", refs:["https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction"] },
      { id:"sd25", title:"Back of Envelope Estimations", desc:"DAU: 1M users, 10 actions/day = 10M events/day ÷ 86400 = ~116 RPS. Storage: 1M users × 1KB profile = 1GB. Tweet: 140 chars = 280 bytes. Powers of 2: 2^10=1K, 2^20=1M, 2^30=1B. Latency: L1 cache 1ns, RAM 100ns, SSD 100μs, HDD 1ms, cross-datacenter 100ms. Know these to size systems quickly.", refs:["https://www.youtube.com/watch?v=UC5xf8FbdJc"] },
      { id:"sd26", title:"Availability & SLA Calculations", desc:"Availability = uptime/(uptime+downtime). 99.9% (3 nines) = 8.7 hours downtime/year. 99.99% (4 nines) = 52 minutes/year. 99.999% (5 nines) = 5 minutes/year. Serial availability: A × B (both must work). Parallel availability: 1 - (1-A)(1-B) (redundancy). Active-active: both serve traffic. Active-passive: failover to standby.", refs:["https://sre.google/sre-book/embracing-risk/"] },
      { id:"sd27", title:"Design: Secure EHR System (Your Project!)", desc:"HIPAA compliance: audit logs for every access. Role-based access: doctor (read/write patients), patient (read own), auditor (read logs). RSA/AES hybrid encryption for sensitive fields. SHA-256 hash chaining: each log entry includes hash of previous — tamper-evident. RAG for clinical query. All API calls authenticated + authorized.", refs:["https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"] },
      { id:"sd28", title:"Design: Labor Analytics Dashboard (Your Project!)", desc:"Data ingestion: technician schedule API → ETL → PostgreSQL. Aggregation layer: precompute utilization metrics (reduce query time). REST APIs: /utilization, /schedule, /forecast. Caching: Redis for expensive aggregations. Real-time: WebSocket for live updates. Charts: Recharts consuming REST API. Auth: JWT + RBAC (manager vs viewer roles).", refs:[] },
      { id:"sd29", title:"Database Selection Framework", desc:"Need complex queries/joins + ACID? → PostgreSQL. Need horizontal scale + flexible schema? → MongoDB. Need sub-millisecond latency + simple operations? → Redis. Need time-series data? → InfluxDB/TimescaleDB. Need full-text search? → Elasticsearch. Need serverless auto-scale? → DynamoDB. Start with PostgreSQL — it handles most use cases.", refs:["https://www.youtube.com/watch?v=W2Z7fbCLSTw"] },
      { id:"sd30", title:"Idempotency & Exactly-Once Processing", desc:"Idempotent: calling the same operation multiple times produces the same result. Critical for: payment processing, order creation, notifications. Implementation: idempotency key (UUID per request), store in Redis/DB, check before processing. Kafka exactly-once: enable.idempotence=true + transactional.id. At-least-once + idempotent consumer = effectively exactly-once.", refs:["https://www.youtube.com/watch?v=IP-rGJKSZ3s"] },
    ]
  },
  {
    id: "lc", label: "LeetCode 150", emoji: "💻", color: "#F97316", custom: false,
    topics: [
      { id:"lc1", title:"Two Sum", desc:"Pattern: Hash Map. Store each number and its index. For each number, check if complement (target - num) exists in map. O(n) time, O(n) space. Classic hashmap pattern: trade space for time to eliminate nested loop.", refs:["https://neetcode.io/problems/two-integer-sum"] },
      { id:"lc2", title:"Best Time to Buy and Sell Stock", desc:"Pattern: Sliding Window / One Pass. Track minimum price seen so far. For each price, profit = price - min_so_far. Update max profit. O(n) time, O(1) space.", refs:["https://neetcode.io/problems/buy-and-sell-crypto"] },
      { id:"lc3", title:"Contains Duplicate", desc:"Pattern: Hash Set. Add each element to set. If already in set, return true. O(n) time, O(n) space. Alternatively: sort and check adjacent elements O(n log n) time O(1) space.", refs:["https://neetcode.io/problems/duplicate-integer"] },
      { id:"lc4", title:"Valid Anagram", desc:"Pattern: Hash Map / Sorting. Count character frequencies in both strings and compare. Or sort both strings and compare. O(n) time, O(1) space (fixed 26 chars).", refs:["https://neetcode.io/problems/is-anagram"] },
      { id:"lc5", title:"Group Anagrams", desc:"Pattern: Hash Map with sorted string as key. Sort each word as key, append to list. All anagrams of same word share the same sorted key. O(n·k·log k) where k = max word length.", refs:["https://neetcode.io/problems/anagram-groups"] },
      { id:"lc6", title:"Top K Frequent Elements", desc:"Pattern: Bucket Sort or Heap. Heap approach: count frequencies, use min-heap of size k. Bucket sort: array of lists indexed by frequency, iterate from high frequency.", refs:["https://neetcode.io/problems/top-k-elements-in-list"] },
      { id:"lc7", title:"Product of Array Except Self", desc:"Pattern: Prefix/Suffix Product. Left pass: prefix products. Right pass: suffix products. Multiply together without division. O(n) time, O(1) extra space (excluding output).", refs:["https://neetcode.io/problems/products-of-array-discluding-self"] },
      { id:"lc8", title:"Valid Palindrome", desc:"Pattern: Two Pointers. Left and right pointers, skip non-alphanumeric, compare lowercase. Move pointers inward. O(n) time, O(1) space.", refs:["https://neetcode.io/problems/is-palindrome"] },
      { id:"lc9", title:"Two Sum II (Sorted)", desc:"Pattern: Two Pointers. Array is sorted. Left pointer starts at 0, right at end. If sum too large: move right left. If too small: move left right. O(n) time, O(1) space.", refs:["https://neetcode.io/problems/two-integer-sum-ii"] },
      { id:"lc10", title:"3Sum", desc:"Pattern: Sort + Two Pointers. Sort array. For each i, use two pointers for remaining elements. Skip duplicates to avoid duplicate triplets. O(n²) time.", refs:["https://neetcode.io/problems/three-integer-sum"] },
      { id:"lc11", title:"Container With Most Water", desc:"Pattern: Two Pointers. Start with widest container. Move the pointer with the shorter height inward (wider shorter side can't be better). O(n) time.", refs:["https://neetcode.io/problems/max-water-container"] },
      { id:"lc12", title:"Longest Substring Without Repeating", desc:"Pattern: Sliding Window + Hash Map. Expand right, when duplicate found: move left past previous occurrence. Track max window size. O(n) time, O(min(n,m)) space.", refs:["https://neetcode.io/problems/longest-substring-without-duplicates"] },
      { id:"lc13", title:"Longest Repeating Character Replacement", desc:"Pattern: Sliding Window. Count frequencies in window. Valid window: length - max_freq ≤ k. Expand right; when invalid, shrink left. O(n) time.", refs:["https://neetcode.io/problems/longest-repeating-substring-with-replacement"] },
      { id:"lc14", title:"Minimum Window Substring", desc:"Pattern: Sliding Window + Two Hash Maps. Expand right until all chars found. Then shrink left to minimize. Track have/need counts. O(n) time.", refs:["https://neetcode.io/problems/minimum-window-with-characters"] },
      { id:"lc15", title:"Binary Search", desc:"Pattern: Binary Search. Classic: lo=0, hi=n-1. mid=(lo+hi)//2. If arr[mid]==target: found. If arr[mid]<target: lo=mid+1. Else: hi=mid-1. O(log n) time.", refs:["https://neetcode.io/problems/binary-search"] },
      { id:"lc16", title:"Search in Rotated Sorted Array", desc:"Pattern: Binary Search. Determine which half is sorted. If target in sorted half: search there. Else: search other half. O(log n) time.", refs:["https://neetcode.io/problems/find-target-in-rotated-sorted-array"] },
      { id:"lc17", title:"Koko Eating Bananas", desc:"Pattern: Binary Search on Answer. Binary search on speed k. Check if k is feasible (can eat all in H hours). Find minimum feasible k. O(n log max_pile) time.", refs:["https://neetcode.io/problems/eating-bananas"] },
      { id:"lc18", title:"Reverse Linked List", desc:"Pattern: Linked List. Iterative: prev=None, curr=head, swap next pointers. Recursive: reverse rest of list, make head.next.next = head. O(n) time, O(1) space iterative.", refs:["https://neetcode.io/problems/reverse-a-linked-list"] },
      { id:"lc19", title:"Merge Two Sorted Lists", desc:"Pattern: Linked List / Merge. Use dummy head node. Compare heads, append smaller, advance that pointer. Append remaining list. O(n+m) time.", refs:["https://neetcode.io/problems/merge-two-sorted-linked-lists"] },
      { id:"lc20", title:"Reorder List", desc:"Pattern: Linked List (find middle + reverse + merge). Find middle with slow/fast pointers. Reverse second half. Merge two halves alternately. O(n) time, O(1) space.", refs:["https://neetcode.io/problems/reorder-linked-list"] },
      { id:"lc21", title:"Remove Nth Node From End", desc:"Pattern: Two Pointers. Advance first pointer n steps. Then move both until first reaches end. Remove second pointer's next. O(n) one pass.", refs:["https://neetcode.io/problems/remove-node-from-end-of-linked-list"] },
      { id:"lc22", title:"Valid Parentheses", desc:"Pattern: Stack. Open bracket: push. Close bracket: check if top of stack matches. Empty stack at end = valid. O(n) time, O(n) space.", refs:["https://neetcode.io/problems/validate-parentheses"] },
      { id:"lc23", title:"Min Stack", desc:"Pattern: Stack. Two stacks: main stack + min stack. Min stack tracks minimum at each level. Push to both; pop from both; getMin returns top of min stack. O(1) all operations.", refs:["https://neetcode.io/problems/minimum-stack"] },
      { id:"lc24", title:"Daily Temperatures", desc:"Pattern: Monotonic Stack (decreasing). Push indices. When current temp > stack top temp: pop and record distance. Next greater element pattern. O(n) time.", refs:["https://neetcode.io/problems/daily-temperatures"] },
      { id:"lc25", title:"Largest Rectangle in Histogram", desc:"Pattern: Monotonic Stack. Push indices of increasing heights. When current height < stack top: pop and calculate area (height × distance to previous remaining index). O(n) time.", refs:["https://neetcode.io/problems/largest-rectangle-in-histogram"] },
      { id:"lc26", title:"Invert Binary Tree", desc:"Pattern: DFS / BFS. Recursively swap left and right children at every node. Base case: null node. O(n) time, O(h) space (h = height).", refs:["https://neetcode.io/problems/invert-a-binary-tree"] },
      { id:"lc27", title:"Maximum Depth of Binary Tree", desc:"Pattern: DFS. Recursive: 1 + max(depth(left), depth(right)). BFS: count levels. Base case: null returns 0. O(n) time.", refs:["https://neetcode.io/problems/depth-of-binary-tree"] },
      { id:"lc28", title:"Diameter of Binary Tree", desc:"Pattern: DFS. At each node, diameter = left_height + right_height. Track global max. Return height = 1 + max(left_height, right_height). O(n) time.", refs:["https://neetcode.io/problems/binary-tree-diameter"] },
      { id:"lc29", title:"Balanced Binary Tree", desc:"Pattern: DFS. Return -1 if unbalanced (|left_height - right_height| > 1). Otherwise return height. If any subtree returns -1, propagate up. O(n) time.", refs:["https://neetcode.io/problems/balanced-binary-tree"] },
      { id:"lc30", title:"Same Tree", desc:"Pattern: DFS. Recursively check: both null (true), one null (false), values differ (false), recurse on left and right. O(n) time.", refs:["https://neetcode.io/problems/same-binary-tree"] },
      { id:"lc31", title:"Subtree of Another Tree", desc:"Pattern: DFS + isSameTree. For each node in main tree, check if subtree rooted there matches target. O(n × m) time.", refs:["https://neetcode.io/problems/subtree-of-a-binary-tree"] },
      { id:"lc32", title:"LCA of Binary Tree", desc:"Pattern: DFS. If node is null/p/q: return node. Recurse left and right. If both return non-null: current node is LCA. Else return the non-null side. O(n) time.", refs:["https://neetcode.io/problems/lowest-common-ancestor-in-binary-search-tree"] },
      { id:"lc33", title:"Binary Tree Level Order Traversal", desc:"Pattern: BFS. Queue starts with root. For each level: record level_size, process that many nodes, add their children. Return list of lists. O(n) time.", refs:["https://neetcode.io/problems/level-order-traversal-of-binary-tree"] },
      { id:"lc34", title:"Binary Tree Right Side View", desc:"Pattern: BFS. Level order traversal, keep only the last node of each level. Or DFS with depth tracking, first visit at each depth. O(n) time.", refs:["https://neetcode.io/problems/binary-tree-right-side-view"] },
      { id:"lc35", title:"Count Good Nodes in Binary Tree", desc:"Pattern: DFS. Pass max value seen so far. Node is 'good' if its value ≥ max on path from root. Count as we traverse. O(n) time.", refs:["https://neetcode.io/problems/count-good-nodes-in-binary-tree"] },
      { id:"lc36", title:"Validate BST", desc:"Pattern: DFS with bounds. Pass min and max bounds. Left child must be < current, right must be >. Initial bounds: (-∞, +∞). O(n) time.", refs:["https://neetcode.io/problems/valid-binary-search-tree"] },
      { id:"lc37", title:"Kth Smallest in BST", desc:"Pattern: Inorder DFS. Inorder traversal of BST gives sorted order. Return kth element encountered. Iterative with stack for O(h+k) time.", refs:["https://neetcode.io/problems/kth-smallest-integer-in-bst"] },
      { id:"lc38", title:"Construct Tree from Preorder/Inorder", desc:"Pattern: DFS + Hash Map. Root is preorder[0]. Find root in inorder — elements left = left subtree. Recursively build. Hash map for O(1) inorder lookup. O(n) time.", refs:["https://neetcode.io/problems/binary-tree-from-preorder-and-inorder-traversal"] },
      { id:"lc39", title:"Number of Islands", desc:"Pattern: BFS/DFS on Grid. For each '1', do BFS/DFS to mark all connected land as visited. Count how many BFS/DFS calls made. O(m×n) time.", refs:["https://neetcode.io/problems/count-number-of-islands"] },
      { id:"lc40", title:"Clone Graph", desc:"Pattern: DFS + Hash Map. Map original node → clone. DFS: if node in map, return clone. Else create clone, add to map, recurse on neighbors. O(V+E) time.", refs:["https://neetcode.io/problems/clone-graph"] },
      { id:"lc41", title:"Pacific Atlantic Water Flow", desc:"Pattern: BFS/DFS from borders. BFS from Pacific (top/left borders) — mark reachable. BFS from Atlantic (bottom/right borders) — mark reachable. Return intersection. O(m×n) time.", refs:["https://neetcode.io/problems/pacific-atlantic-water-flow"] },
      { id:"lc42", title:"Course Schedule (Cycle Detection)", desc:"Pattern: Topological Sort / Cycle Detection. Build adjacency list. DFS with 3 states: unvisited, visiting (in current path), visited. Cycle if we reach a 'visiting' node. O(V+E) time.", refs:["https://neetcode.io/problems/course-schedule"] },
      { id:"lc43", title:"Course Schedule II (Topo Sort)", desc:"Pattern: Topological Sort (Kahn's / DFS). Return ordering using topological sort. If cycle exists: return []. Kahn's: process nodes with in-degree 0 first. O(V+E) time.", refs:["https://neetcode.io/problems/course-schedule-ii"] },
      { id:"lc44", title:"Graph Valid Tree", desc:"Pattern: Union-Find / DFS. Tree conditions: n-1 edges and fully connected. Check no cycle: Union-Find detects cycle when unioning already-connected nodes. O(n) with path compression.", refs:["https://neetcode.io/problems/valid-tree"] },
      { id:"lc45", title:"Number of Connected Components", desc:"Pattern: Union-Find / DFS. Initialize count = n. Union each edge; when two different components merge, decrement count. Final count = number of components. O(n·α(n)) with path compression.", refs:["https://neetcode.io/problems/count-connected-components"] },
      { id:"lc46", title:"Word Ladder", desc:"Pattern: BFS (shortest path). Each word = node. Edge if words differ by 1 char. BFS finds shortest path. Key optimization: precompute word patterns ('h*t') to find neighbors in O(1). O(n × m²) time.", refs:["https://leetcode.com/problems/word-ladder/"] },
      { id:"lc47", title:"Kth Largest Element in Array", desc:"Pattern: QuickSelect or Min-Heap. QuickSelect: O(n) average. Min-heap of size k: O(n log k). In Python: heapq.nlargest(k, nums)[-1]. Know both approaches.", refs:["https://neetcode.io/problems/kth-largest-element-in-an-array"] },
      { id:"lc48", title:"Find Median from Data Stream", desc:"Pattern: Two Heaps. Max-heap for lower half, min-heap for upper half. Keep sizes balanced (differ by at most 1). Median = top of larger heap or average of both tops. O(log n) insert, O(1) median.", refs:["https://neetcode.io/problems/find-median-in-a-data-stream"] },
      { id:"lc49", title:"Task Scheduler", desc:"Pattern: Greedy + Heap. Most frequent task limits minimum time. Idle slots = max(0, (max_freq-1) × (n+1) + count_of_max_freq_tasks) - other_tasks. O(n) time.", refs:["https://neetcode.io/problems/task-scheduling"] },
      { id:"lc50", title:"Implement Trie", desc:"Pattern: Trie. TrieNode: children={}, is_end=False. Insert: walk/create nodes for each char. Search: walk nodes, check is_end. StartsWith: walk nodes, any node found. O(m) per operation.", refs:["https://neetcode.io/problems/implement-prefix-tree"] },
      { id:"lc51", title:"Design Add and Search Words", desc:"Pattern: Trie + DFS for wildcards. '.' matches any character — at '.' node, DFS all children. Regular char: standard trie traversal. O(m) for insert, O(26^m) worst case search.", refs:["https://neetcode.io/problems/design-word-search-data-structure"] },
      { id:"lc52", title:"Word Search II", desc:"Pattern: Trie + DFS on Grid. Build trie from word list. DFS on grid, traverse trie simultaneously. When trie node has is_end=True, found a word. Prune trie nodes to avoid reuse. O(m×n×4^L) time.", refs:["https://neetcode.io/problems/search-for-word-ii"] },
      { id:"lc53", title:"Subsets", desc:"Pattern: Backtracking. For each element: include it or don't. DFS tree with 2 choices per element. Or iterative: start with [[]], for each num add it to all existing subsets. O(2^n) time and space.", refs:["https://neetcode.io/problems/subsets"] },
      { id:"lc54", title:"Combination Sum", desc:"Pattern: Backtracking. Can reuse same number. DFS: try each candidate ≥ current index. Subtract from target. Base: target=0 → found. Prune: target<0 → stop. O(2^(t/m)) where t=target, m=min candidate.", refs:["https://neetcode.io/problems/combination-target-sum"] },
      { id:"lc55", title:"Permutations", desc:"Pattern: Backtracking. Swap elements to build permutations. Or: for each position, try all unused numbers. DFS with visited set. Base: permutation length = n → add to result. O(n! × n) time.", refs:["https://neetcode.io/problems/permutations"] },
      { id:"lc56", title:"Subsets II (with duplicates)", desc:"Pattern: Backtracking + Skip Duplicates. Sort array first. In backtracking, skip duplicate values at same depth level (if i>start and nums[i]==nums[i-1]: skip). O(2^n) time.", refs:["https://neetcode.io/problems/subsets-ii"] },
      { id:"lc57", title:"Word Search (Grid)", desc:"Pattern: Backtracking on Grid. DFS from each cell matching first char. Mark visited (board[r][c]='#'). Backtrack by restoring. Prune early: if current char doesn't match word[index]. O(m×n×4^L) time.", refs:["https://neetcode.io/problems/search-for-word"] },
      { id:"lc58", title:"Palindrome Partitioning", desc:"Pattern: Backtracking + DP. DFS: for each prefix, if palindrome → recurse on rest. Memoize isPalindrome with 2D DP. O(n×2^n) time with backtracking.", refs:["https://neetcode.io/problems/palindrome-partitioning"] },
      { id:"lc59", title:"Climbing Stairs", desc:"Pattern: Dynamic Programming (1D). dp[i] = dp[i-1] + dp[i-2]. Base: dp[1]=1, dp[2]=2. Same as Fibonacci. Can optimize to O(1) space with two variables. Gateway DP problem.", refs:["https://neetcode.io/problems/climbing-stairs"] },
      { id:"lc60", title:"House Robber", desc:"Pattern: Dynamic Programming (1D). dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Can't rob adjacent houses. Space-optimize to two variables. O(n) time, O(1) space.", refs:["https://neetcode.io/problems/house-robber"] },
      { id:"lc61", title:"House Robber II (Circular)", desc:"Pattern: DP. Run House Robber twice: once on nums[0..n-2], once on nums[1..n-1]. Return max of both. Can't rob first and last (they're adjacent in circle). O(n) time.", refs:["https://neetcode.io/problems/house-robber-ii"] },
      { id:"lc62", title:"Longest Palindromic Substring", desc:"Pattern: Expand Around Center. For each center (n centers for odd, n-1 for even), expand while chars match. Track max. O(n²) time, O(1) space. Manacher's algorithm O(n) — not required.", refs:["https://neetcode.io/problems/longest-palindromic-substring"] },
      { id:"lc63", title:"Palindromic Substrings (Count)", desc:"Pattern: Expand Around Center. For each center, count palindromes by expanding. 2n-1 centers. O(n²) time, O(1) space.", refs:["https://neetcode.io/problems/palindromic-substrings"] },
      { id:"lc64", title:"Decode Ways", desc:"Pattern: Dynamic Programming. dp[i] = ways to decode s[0..i]. If s[i]!='0': dp[i] += dp[i-1]. If s[i-1..i] is 10-26: dp[i] += dp[i-2]. Handle '0' edge cases carefully.", refs:["https://neetcode.io/problems/decode-ways"] },
      { id:"lc65", title:"Coin Change", desc:"Pattern: Dynamic Programming. dp[i] = min coins for amount i. For each amount, try each coin. dp[i] = min(dp[i], dp[i-coin]+1). Initialize dp to infinity, dp[0]=0. O(n×amount) time.", refs:["https://neetcode.io/problems/coin-change"] },
      { id:"lc66", title:"Maximum Product Subarray", desc:"Pattern: Dynamic Programming. Track both max and min (negative × negative = positive). max_dp[i] = max(nums[i], max_dp[i-1]*nums[i], min_dp[i-1]*nums[i]). Track global max. O(n) time.", refs:["https://neetcode.io/problems/maximum-product-subarray"] },
      { id:"lc67", title:"Word Break", desc:"Pattern: Dynamic Programming. dp[i] = can s[0..i] be segmented. For each i, check all j<i: if dp[j] and s[j..i] in wordDict: dp[i]=True. O(n²×m) time.", refs:["https://neetcode.io/problems/word-break"] },
      { id:"lc68", title:"Longest Increasing Subsequence", desc:"Pattern: Dynamic Programming O(n²) or Binary Search O(n log n). dp[i] = LIS ending at i. For each i, check all j<i. O(n²) DP. Patience sorting with binary search for O(n log n). Classic problem.", refs:["https://neetcode.io/problems/longest-increasing-subsequence"] },
      { id:"lc69", title:"Unique Paths (Grid DP)", desc:"Pattern: Dynamic Programming. dp[i][j] = ways to reach (i,j). dp[i][j] = dp[i-1][j] + dp[i][j-1]. Base: first row and column = 1. Can optimize to 1D array. O(m×n) time.", refs:["https://neetcode.io/problems/count-paths"] },
      { id:"lc70", title:"Jump Game", desc:"Pattern: Greedy. Track max reachable index. If current index > max_reach: can't proceed. Update max_reach = max(max_reach, i + nums[i]). O(n) time.", refs:["https://neetcode.io/problems/jump-game"] },
      { id:"lc71", title:"Jump Game II (Min Jumps)", desc:"Pattern: Greedy BFS. Level = current jump. Track current_end (farthest reach of current jump) and farthest (farthest reach seen so far). When reaching current_end: increment jumps, update current_end. O(n) time.", refs:["https://neetcode.io/problems/jump-game-ii"] },
      { id:"lc72", title:"Gas Station", desc:"Pattern: Greedy. Total gas ≥ total cost → solution exists. Track current tank. When tank drops below 0: reset, start from next station. O(n) time.", refs:["https://neetcode.io/problems/gas-station"] },
      { id:"lc73", title:"Hand of Straights", desc:"Pattern: Greedy + Sorted Map. Count frequencies. For each smallest card, form a group of W consecutive cards. If any card not available: impossible. O(n log n) time.", refs:["https://neetcode.io/problems/hand-of-straights"] },
      { id:"lc74", title:"Merge Intervals", desc:"Pattern: Sort + Greedy. Sort by start time. For each interval: if overlaps with last merged: extend end. Else: add new interval. O(n log n) time.", refs:["https://neetcode.io/problems/merge-intervals"] },
      { id:"lc75", title:"Insert Interval", desc:"Pattern: Linear Scan. Add all intervals that end before new interval starts. Merge all overlapping intervals with new interval. Add remaining. O(n) time.", refs:["https://neetcode.io/problems/insert-new-interval"] },
      { id:"lc76", title:"Non-Overlapping Intervals", desc:"Pattern: Greedy. Sort by end time. Greedily keep intervals with earliest end. Remove interval when it overlaps with last kept. Count removed. O(n log n) time.", refs:["https://neetcode.io/problems/non-overlapping-intervals"] },
      { id:"lc77", title:"Meeting Rooms II (Min Rooms)", desc:"Pattern: Min-Heap or Sort. Sort by start. Use min-heap to track end times. If new meeting starts after heap min: reuse room (pop). Else: add room. Heap size = min rooms needed. O(n log n) time.", refs:["https://neetcode.io/problems/meeting-rooms-ii"] },
      { id:"lc78", title:"Rotate Image (Matrix)", desc:"Pattern: Transpose + Reverse. Clockwise 90°: transpose (swap arr[i][j] with arr[j][i]), then reverse each row. In-place O(1) space. Counter-clockwise: reverse rows first, then transpose. O(n²) time.", refs:["https://neetcode.io/problems/rotate-matrix"] },
      { id:"lc79", title:"Spiral Matrix", desc:"Pattern: Simulation. Maintain top/bottom/left/right boundaries. Traverse right → down → left → up. Shrink boundaries after each pass. O(m×n) time.", refs:["https://neetcode.io/problems/spiral-matrix"] },
      { id:"lc80", title:"Set Matrix Zeroes", desc:"Pattern: Use first row/col as markers. Scan matrix: if cell is 0, mark its row/col in first row/first col. Second pass: zero out marked rows/cols. O(m×n) time, O(1) space.", refs:["https://neetcode.io/problems/zero-matrix"] },
      { id:"lc81", title:"Happy Number", desc:"Pattern: Fast & Slow Pointers (Floyd's Cycle Detection). Compute sum of squared digits. If 1: happy. If cycle detected (slow==fast): not happy. Or use a set to detect revisited numbers. O(log n) time.", refs:["https://neetcode.io/problems/happy-number"] },
      { id:"lc82", title:"Plus One", desc:"Pattern: Array Manipulation. Start from rightmost digit. Add 1, carry if 9. If all 9s: prepend 1. Handle edge case of all 9s by checking carry at end. O(n) time.", refs:["https://neetcode.io/problems/plus-one"] },
      { id:"lc83", title:"Pow(x, n)", desc:"Pattern: Fast Exponentiation. Recursive: if n even: pow(x²,n/2). If n odd: x × pow(x,n-1). O(log n) time. Handle negative n: 1/pow(x,-n). Handle n=0: return 1.", refs:["https://neetcode.io/problems/pow-x-n"] },
      { id:"lc84", title:"Sqrt(x)", desc:"Pattern: Binary Search. Binary search in [1, x//2+1]. Find largest k where k²≤x. O(log x) time.", refs:["https://neetcode.io/problems/sqrt"] },
      { id:"lc85", title:"Reverse Bits", desc:"Pattern: Bit Manipulation. For each of 32 bits: extract bit with n&1, add to result with result|=bit<<(31-i), shift n right. O(32) = O(1) time.", refs:["https://neetcode.io/problems/reverse-bits"] },
      { id:"lc86", title:"Number of 1 Bits", desc:"Pattern: Bit Manipulation. Brian Kernighan's: n &= (n-1) removes lowest set bit. Count iterations. Or: count = bin(n).count('1'). O(number of set bits) time.", refs:["https://neetcode.io/problems/number-of-one-bits"] },
      { id:"lc87", title:"Counting Bits", desc:"Pattern: DP + Bit Manipulation. dp[i] = dp[i>>1] + (i&1). Right shift removes last bit; add 1 if last bit was 1. O(n) time, O(n) space.", refs:["https://neetcode.io/problems/counting-bits"] },
      { id:"lc88", title:"Missing Number", desc:"Pattern: XOR or Math. XOR all indices and all values — XOR of matching pairs cancels, leaving missing number. Or: expected sum - actual sum = missing number. O(n) time, O(1) space.", refs:["https://neetcode.io/problems/missing-number"] },
      { id:"lc89", title:"Sum of Two Integers (No + or -)", desc:"Pattern: Bit Manipulation. XOR gives sum without carry. AND << 1 gives carry. Repeat until no carry. Handle negative numbers with mask for 32-bit simulation. O(1) time.", refs:["https://neetcode.io/problems/sum-of-two-integers"] },
      { id:"lc90", title:"Single Number", desc:"Pattern: XOR. XOR of same numbers = 0. XOR all numbers, remaining = the single number. O(n) time, O(1) space. Elegant one-liner: return reduce(xor, nums).", refs:["https://neetcode.io/problems/single-number"] },
      { id:"lc91", title:"Longest Common Subsequence", desc:"Pattern: 2D Dynamic Programming. dp[i][j] = LCS of s1[0..i] and s2[0..j]. If match: dp[i][j]=dp[i-1][j-1]+1. Else: max(dp[i-1][j], dp[i][j-1]). O(m×n) time and space.", refs:["https://neetcode.io/problems/longest-common-subsequence"] },
      { id:"lc92", title:"Edit Distance", desc:"Pattern: 2D Dynamic Programming. dp[i][j] = min ops to convert s1[0..i] to s2[0..j]. If match: dp[i-1][j-1]. Else: 1 + min(insert=dp[i][j-1], delete=dp[i-1][j], replace=dp[i-1][j-1]).", refs:["https://neetcode.io/problems/edit-distance"] },
      { id:"lc93", title:"Distinct Subsequences", desc:"Pattern: 2D Dynamic Programming. dp[i][j] = ways to form t[0..j] from s[0..i]. If s[i]==t[j]: dp[i-1][j-1] + dp[i-1][j]. Else: dp[i-1][j]. O(m×n) time.", refs:["https://neetcode.io/problems/distinct-subsequences"] },
      { id:"lc94", title:"Interleaving String", desc:"Pattern: 2D DP. dp[i][j] = can s1[0..i] and s2[0..j] interleave to form s3[0..i+j]. Transition: from left or from above, if chars match. O(m×n) time.", refs:["https://neetcode.io/problems/interleaving-string"] },
      { id:"lc95", title:"Burst Balloons", desc:"Pattern: Interval DP. dp[l][r] = max coins from bursting all balloons between l and r. For each k as LAST balloon to burst: dp[l][r] = max(dp[l][k]+dp[k][r]+nums[l]*nums[k]*nums[r]). O(n³) time.", refs:["https://neetcode.io/problems/burst-balloons"] },
      { id:"lc96", title:"Regular Expression Matching", desc:"Pattern: 2D DP. dp[i][j] = does s[0..i] match p[0..j]. Handle '*': matches 0 times (dp[i][j-2]) or matches current char (dp[i-1][j] if s[i]==p[j-1] or p[j-1]=='.'). O(m×n) time.", refs:["https://neetcode.io/problems/regular-expression-matching"] },
      { id:"lc97", title:"LRU Cache", desc:"Pattern: HashMap + Doubly Linked List. O(1) get and put. HashMap: key → node. DLL: order by recency (head=most recent, tail=least). Get: move node to head. Put: add to head, evict tail if over capacity.", refs:["https://neetcode.io/problems/lru-cache"] },
      { id:"lc98", title:"Time Based Key-Value Store", desc:"Pattern: Binary Search on value. HashMap: key → list of (timestamp, value) sorted by timestamp. Get: binary search for largest timestamp ≤ given timestamp. O(log n) per get.", refs:["https://neetcode.io/problems/time-based-key-value-store"] },
      { id:"lc99", title:"Design Twitter", desc:"Pattern: OOP + Heap. User has followees and tweet list. getFeed: merge tweets from all followees (max 10 most recent). Use min-heap to efficiently merge k sorted lists (tweets are ordered by tweet_id). O(n log n) per getFeed.", refs:["https://neetcode.io/problems/design-twitter-feed"] },
      { id:"lc100", title:"Find Minimum in Rotated Sorted Array", desc:"Pattern: Binary Search. If arr[mid] > arr[right]: min is in right half. Else: min is in left half including mid. Return arr[lo] when lo==hi. O(log n) time.", refs:["https://neetcode.io/problems/find-minimum-in-rotated-sorted-array"] },
      { id:"lc101", title:"Median of Two Sorted Arrays", desc:"Pattern: Binary Search on partition. Binary search on shorter array's partition point. Ensure left halves combined ≤ right halves. Find correct partition where max_left ≤ min_right. O(log min(m,n)) time.", refs:["https://neetcode.io/problems/median-of-two-sorted-arrays"] },
      { id:"lc102", title:"Maximum Subarray (Kadane's)", desc:"Pattern: Dynamic Programming / Greedy. current_sum = max(num, current_sum + num). If adding to subarray makes it worse than starting fresh, start fresh. Track max_sum. O(n) time, O(1) space.", refs:["https://neetcode.io/problems/maximum-subarray"] },
      { id:"lc103", title:"Minimum Size Subarray Sum", desc:"Pattern: Sliding Window. Expand right, add to sum. When sum ≥ target: shrink left, update min length. O(n) time, O(1) space.", refs:["https://neetcode.io/problems/minimum-size-subarray-sum"] },
      { id:"lc104", title:"Sliding Window Maximum", desc:"Pattern: Monotonic Deque. Maintain deque of indices in decreasing order. Front = max of window. Remove elements outside window from front. Remove smaller elements from back. O(n) time.", refs:["https://neetcode.io/problems/sliding-window-maximum"] },
      { id:"lc105", title:"Remove Duplicates from Sorted Array", desc:"Pattern: Two Pointers. Slow pointer tracks unique count. Fast pointer scans. When fast finds new unique value, place at slow+1. Return slow+1. O(n) time, O(1) space.", refs:["https://neetcode.io/problems/remove-duplicates-from-sorted-array"] },
      { id:"lc106", title:"Move Zeroes", desc:"Pattern: Two Pointers. Slow pointer tracks position for next non-zero. Fast pointer scans. Swap when fast finds non-zero. O(n) time, O(1) space.", refs:["https://neetcode.io/problems/move-zeroes"] },
      { id:"lc107", title:"Sort Colors (Dutch National Flag)", desc:"Pattern: Three Pointers. Pointers: low (next 0 position), mid (current), high (next 2 position). Swap based on arr[mid]. Increment/decrement accordingly. O(n) time, O(1) space.", refs:["https://neetcode.io/problems/sort-colors"] },
      { id:"lc108", title:"Majority Element", desc:"Pattern: Boyer-Moore Voting. Candidate + count. If count=0: new candidate. If matches candidate: count++. Else: count--. Majority element always survives. O(n) time, O(1) space.", refs:["https://neetcode.io/problems/majority-element"] },
      { id:"lc109", title:"Next Permutation", desc:"Pattern: Array Manipulation. Find rightmost ascent (i where arr[i]<arr[i+1]). Find smallest element > arr[i] to its right. Swap. Reverse suffix after i. O(n) time.", refs:["https://neetcode.io/problems/next-permutation"] },
      { id:"lc110", title:"Find All Anagrams in String", desc:"Pattern: Sliding Window + Frequency Count. Fixed window of size p. Compare character frequencies. Use a count of 'matches' to check in O(1). O(n) time.", refs:["https://neetcode.io/problems/find-all-anagrams-in-a-string"] },
      { id:"lc111", title:"Longest Common Prefix", desc:"Pattern: Vertical Scan. Compare char by char across all strings at same position. Stop when mismatch or string ends. O(n×m) time.", refs:["https://neetcode.io/problems/longest-common-prefix"] },
      { id:"lc112", title:"String to Integer (atoi)", desc:"Pattern: Simulation. Skip whitespace. Check sign. Parse digits until non-digit. Clamp to INT_MIN/INT_MAX. Handle edge cases: empty string, no digits, overflow. O(n) time.", refs:["https://leetcode.com/problems/string-to-integer-atoi/"] },
      { id:"lc113", title:"Zigzag Conversion", desc:"Pattern: Simulation. Assign each char to a row (0→numRows-1→0...). Track current row and direction. Concatenate rows. O(n) time.", refs:["https://leetcode.com/problems/zigzag-conversion/"] },
      { id:"lc114", title:"Trapping Rain Water", desc:"Pattern: Two Pointers or Monotonic Stack. Two pointers: left_max and right_max. Water at i = min(left_max, right_max) - height[i]. Move pointer with smaller max. O(n) time, O(1) space.", refs:["https://neetcode.io/problems/trapping-rain-water"] },
      { id:"lc115", title:"Basic Calculator II", desc:"Pattern: Stack. For each number: based on previous operator, push to stack (+: push, -: push negative, *: pop and push product, /: pop and push quotient). Sum stack at end. O(n) time.", refs:["https://neetcode.io/problems/basic-calculator-ii"] },
      { id:"lc116", title:"Evaluate Reverse Polish Notation", desc:"Pattern: Stack. For each token: if number push. If operator: pop two, apply operator, push result. Final stack element is result. O(n) time.", refs:["https://neetcode.io/problems/evaluate-reverse-polish-notation"] },
      { id:"lc117", title:"Generate Parentheses", desc:"Pattern: Backtracking. Track open count and close count. Can add '(' if open < n. Can add ')' if close < open. Base: length = 2n. O(4^n / sqrt(n)) time (Catalan number).", refs:["https://neetcode.io/problems/generate-parentheses"] },
      { id:"lc118", title:"Letter Combinations of Phone Number", desc:"Pattern: Backtracking. Map digit to letters. DFS: for each position, try each mapped letter. Base: length = digits length → add to result. O(4^n × n) time.", refs:["https://neetcode.io/problems/combination-of-phone-numbers"] },
      { id:"lc119", title:"N-Queens", desc:"Pattern: Backtracking. Place queens row by row. Track attacked columns, diagonals (/), and anti-diagonals (\\). A queen at (r,c) attacks column c, diagonal r-c, anti-diagonal r+c. O(n!) time.", refs:["https://neetcode.io/problems/n-queens"] },
      { id:"lc120", title:"Sudoku Solver", desc:"Pattern: Backtracking. For each empty cell, try 1-9. Check row/col/3×3 box constraints. If valid: place and recurse. If no valid: backtrack. O(9^(empty cells)) worst case.", refs:["https://leetcode.com/problems/sudoku-solver/"] },
      { id:"lc121", title:"Walls and Gates", desc:"Pattern: BFS from all gates simultaneously. Start BFS from all gates (value 0) at once. Distance = BFS level. Rooms (INF) get filled with shortest distance to nearest gate. O(m×n) time.", refs:["https://neetcode.io/problems/islands-and-treasure"] },
      { id:"lc122", title:"Rotting Oranges", desc:"Pattern: Multi-source BFS. Start BFS from all rotten oranges simultaneously. Each BFS level = 1 minute. Count remaining fresh oranges. If any fresh remain after BFS: return -1. O(m×n) time.", refs:["https://neetcode.io/problems/rotting-fruit"] },
      { id:"lc123", title:"Surrounded Regions", desc:"Pattern: DFS/BFS from borders. O cells on border and connected to border can't be flipped. DFS from border O cells, mark as safe. Flip all remaining O to X. O(m×n) time.", refs:["https://neetcode.io/problems/surrounded-regions"] },
      { id:"lc124", title:"Redundant Connection", desc:"Pattern: Union-Find. Process edges one by one. If both endpoints already in same component: this edge creates a cycle (answer). Else: union them. O(n·α(n)) time.", refs:["https://neetcode.io/problems/redundant-connection"] },
      { id:"lc125", title:"Swim in Rising Water", desc:"Pattern: Dijkstra / Binary Search + DFS. Dijkstra: min-heap, cost to reach cell = max(cost so far, cell value). Or binary search on answer + DFS to check feasibility. O(n² log n) time.", refs:["https://neetcode.io/problems/swim-in-rising-water"] },
      { id:"lc126", title:"Foreign Dictionary (Topo Sort)", desc:"Pattern: Topological Sort. Build graph from adjacent word pairs (first differing char). Detect cycle (not valid order). Return topological order. Edge case: prefix pair in wrong order = invalid.", refs:["https://neetcode.io/problems/foreign-dictionary"] },
      { id:"lc127", title:"Network Delay Time", desc:"Pattern: Dijkstra. Shortest path from source to all nodes. Return max of all distances (time for signal to reach all nodes). If any node unreachable: return -1. O((V+E) log V) time.", refs:["https://neetcode.io/problems/network-delay-time"] },
      { id:"lc128", title:"Min Cost to Connect All Points", desc:"Pattern: Prim's MST. Start from any point. Min-heap with (cost, point). Add cheapest edge to unvisited point. Manhattan distance as edge weight. O(n² log n) time.", refs:["https://neetcode.io/problems/min-cost-to-connect-points"] },
      { id:"lc129", title:"Cheapest Flights Within K Stops", desc:"Pattern: Bellman-Ford (K iterations) or Dijkstra with state. BF: relax edges K+1 times. Use copy of previous distances to avoid using same-iteration updates. O(K × E) time.", refs:["https://neetcode.io/problems/cheapest-flights-within-k-stops"] },
      { id:"lc130", title:"Reconstruct Itinerary", desc:"Pattern: Hierholzer's Algorithm (Eulerian path). DFS with sorted neighbors (to get lexicographically smallest). Add node to result when all neighbors visited (post-order). Reverse at end. O(E log E) time.", refs:["https://neetcode.io/problems/reconstruct-flight-path"] },
      { id:"lc131", title:"Serialize and Deserialize Binary Tree", desc:"Pattern: BFS or DFS serialization. BFS: level order with null markers. Deserialize: queue of nodes, assign children from serialized list. DFS: preorder with '#' for null. Both O(n) time.", refs:["https://neetcode.io/problems/serialize-and-deserialize-binary-tree"] },
      { id:"lc132", title:"Binary Tree Maximum Path Sum", desc:"Pattern: DFS. At each node: max path through node = node.val + max(0,left_gain) + max(0,right_gain). Update global max. Return node.val + max(0, max(left,right)) for parent. O(n) time.", refs:["https://neetcode.io/problems/binary-tree-maximum-path-sum"] },
      { id:"lc133", title:"Max Path Sum (Root to Leaf)", desc:"Pattern: DFS. Similar to above but restricted to root-to-leaf paths. Accumulate sum downward. Update max when reaching leaf. O(n) time.", refs:["https://leetcode.com/problems/path-sum-iii/"] },
      { id:"lc134", title:"All Nodes Distance K in Binary Tree", desc:"Pattern: Graph conversion + BFS. Convert tree to undirected graph (add parent pointers). BFS from target node, stop at distance K. O(n) time.", refs:["https://neetcode.io/problems/all-nodes-distance-k-in-binary-tree"] },
      { id:"lc135", title:"Binary Search Tree Iterator", desc:"Pattern: Stack (controlled inorder). Push leftmost path to stack. next(): pop top (that's next smallest), push its right subtree's leftmost path. O(1) amortized, O(h) space.", refs:["https://neetcode.io/problems/binary-search-tree-iterator"] },
      { id:"lc136", title:"Longest Consecutive Sequence", desc:"Pattern: Hash Set. For each number, check if it's the start of a sequence (num-1 not in set). If start: count consecutive numbers. O(n) time — each number processed twice at most.", refs:["https://neetcode.io/problems/longest-consecutive-sequence"] },
      { id:"lc137", title:"4Sum II (Count Tuples)", desc:"Pattern: HashMap. Split into two pairs. Store all sums from first two arrays in map with frequency. For each sum from last two arrays, find complement in map. O(n²) time.", refs:["https://leetcode.com/problems/4sum-ii/"] },
      { id:"lc138", title:"Minimum Interval to Include Query", desc:"Pattern: Sort + Min-Heap. Sort intervals and queries. Process queries in order. Add intervals that start ≤ query to heap by (size, end). Remove expired intervals from heap. O((n+q) log n) time.", refs:["https://neetcode.io/problems/minimum-interval-including-query"] },
      { id:"lc139", title:"Car Fleet", desc:"Pattern: Monotonic Stack / Sort. Sort by position. Calculate time to reach target. Slower fleet behind faster fleet = same fleet. If next car arrives later than current: new fleet (push to stack). Stack size = number of fleets. O(n log n) time.", refs:["https://neetcode.io/problems/car-fleet"] },
      { id:"lc140", title:"Design Circular Deque", desc:"Pattern: Array or Doubly Linked List. Array: use two pointers (front, rear) with modular arithmetic. All operations O(1). Handle full/empty conditions carefully.", refs:["https://leetcode.com/problems/design-circular-deque/"] },
      { id:"lc141", title:"Longest Valid Parentheses", desc:"Pattern: Stack or DP. Stack stores indices. Push -1 as base. For '(': push index. For ')': pop; if stack empty push current index as new base; else update max length = i - stack.top. O(n) time.", refs:["https://leetcode.com/problems/longest-valid-parentheses/"] },
      { id:"lc142", title:"Maximal Rectangle", desc:"Pattern: Histogram + Monotonic Stack. For each row, compute height array (consecutive 1s above). Apply 'Largest Rectangle in Histogram' algorithm. O(m×n) time.", refs:["https://neetcode.io/problems/maximum-rectangle-in-histogram"] },
      { id:"lc143", title:"Minimum Number of Arrows", desc:"Pattern: Greedy Intervals. Sort by end. Shoot at first balloon's end. Skip all balloons that contain this point. When balloon starts after current arrow: shoot new arrow. O(n log n) time.", refs:["https://neetcode.io/problems/minimum-number-of-arrows-to-burst-balloons"] },
      { id:"lc144", title:"Count of Smaller Numbers After Self", desc:"Pattern: Merge Sort or BIT/Fenwick Tree. During merge sort, count inversions. Or use Binary Indexed Tree with coordinate compression. O(n log n) time.", refs:["https://leetcode.com/problems/count-of-smaller-numbers-after-self/"] },
      { id:"lc145", title:"Decode String", desc:"Pattern: Stack. Push characters until ']'. On ']': pop until '[', form string. Pop number. Repeat string × number. Push back. O(output length) time.", refs:["https://neetcode.io/problems/decode-string"] },
      { id:"lc146", title:"Longest Palindrome (Chars)", desc:"Pattern: Greedy / Hash Set. Count char frequencies. Add all even counts. For odd: add count-1. If any odd count exists: add 1 for center. O(n) time.", refs:["https://neetcode.io/problems/longest-palindrome"] },
      { id:"lc147", title:"Two Sum IV (BST)", desc:"Pattern: BFS/DFS + Hash Set. Traverse BST, for each value check if complement exists in set. Add current value to set. O(n) time, O(n) space.", refs:["https://leetcode.com/problems/two-sum-iv-input-is-a-bst/"] },
      { id:"lc148", title:"Partition Equal Subset Sum", desc:"Pattern: 0/1 Knapsack DP. dp[j] = can we achieve sum j. For each num: iterate j from target down (to avoid reuse). dp[j] |= dp[j-num]. O(n × sum) time.", refs:["https://neetcode.io/problems/partition-equal-subset-sum"] },
      { id:"lc149", title:"Target Sum (Count ways)", desc:"Pattern: DP / DFS with memo. Assign + or - to each number. Sum of positives = (target + total_sum) / 2. Then count subsets with this sum. O(n × sum) time.", refs:["https://neetcode.io/problems/target-sum"] },
      { id:"lc150", title:"Coin Change II (Number of Ways)", desc:"Pattern: Unbounded Knapsack DP. dp[j] = number of ways to make amount j. For each coin: dp[j] += dp[j-coin]. Iterate coins in outer loop (unbounded). dp[0]=1. O(n × amount) time.", refs:["https://neetcode.io/problems/coin-change-ii"] },
    ]
  },
];

const MOTIVATION = [
  "You moved from India to LA for a USC master's. That wasn't easy. This prep isn't either — but you've already proven you do hard things.",
  "3 years of real production experience. You've deployed FDA-regulated software. Most candidates interviewing alongside you haven't shipped anything real.",
  "Your Jubilant app replaced actual spreadsheets for real people. That's software engineering. The interview is just talking about what you already know how to do.",
  "You built a HIPAA-compliant EHR system from scratch. You understand security, compliance, and production. That's rare at your level.",
  "Every concept that feels unfamiliar right now is just vocabulary you haven't attached to things you already do. You know this stuff. You just need the words.",
  "The offer you're working toward will pay for years of your life. A few months of focused prep is the highest ROI work you'll ever do.",
  "You're not starting from zero. You're a working engineer learning to articulate what you already know. That's a very different, much easier problem.",
  "USC MS CS, 3+ years experience, AWS certified, full-stack AND AI experience. Your resume opens doors. Your prep is what walks through them.",
  "LeaveNow is a real distributed system with circuit breakers and Redis caching. Most people who interview at FAANG have never built anything that complex.",
  "The difference between you and the person who gets the offer isn't intelligence or experience. It's preparation. You're doing the work. Keep going.",
  "Feeling overwhelmed by the list? That means you're being honest with yourself about what you need to learn. That's the first step. Most people skip it.",
  "Every Google, Meta, and Stripe engineer felt exactly like you do right now before they got their offer. The prep feels impossible until the day it doesn't.",
];

// ─── STORAGE KEYS ─────────────────────────────────────────────────────────────
const KEY_SECTIONS = "prep_sections_v4";
const KEY_CHECKED  = "prep_checked_v4";
const KEY_NOTES    = "prep_notes_v4";
const KEY_TIMER    = "prep_timer_v4";
const KEY_TASKS    = "prep_tasks_v4";
const GENERAL_TIMER_ID = "__general__";


function getDateKey(offset = 0) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toDateString();
}

function shortDayLabel(dateKey) {
  const d = new Date(dateKey);
  return Number.isNaN(d.getTime())
    ? dateKey
    : d.toLocaleDateString("en-US", { weekday: "short" });
}

export default function App() {
  // ── STATE ──────────────────────────────────────────────────────────────────
  const [sections, setSections]       = useState(DEFAULT_SECTIONS);
  const [checked, setChecked]         = useState({});
  const [notes, setNotes]             = useState({});
  const [activeSection, setActiveSection] = useState("fe");
  const [activeTopic, setActiveTopic]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [motivation, setMotivation]   = useState(null);
  const [showMotivation, setShowMotivation] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddTopic, setShowAddTopic]     = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newTopic, setNewTopic]       = useState({ title: "", desc: "", ref: "" });
  const [tasks, setTasks]             = useState([]);
  const [newTask, setNewTask]         = useState("");
  const [timerData, setTimerData]     = useState({});
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerTick, setTimerTick]     = useState(0);
  const [view, setView]               = useState("topics");
  const [searchQuery, setSearchQuery] = useState("");
  const timerRef = useRef(null);

  // ── STORAGE LOAD ───────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [s, c, n, t, tk] = await Promise.all([
        load(KEY_SECTIONS), load(KEY_CHECKED), load(KEY_NOTES),
        load(KEY_TIMER),    load(KEY_TASKS)
      ]);
      if (s)  setSections(s);
      if (c)  setChecked(c);
      if (n)  setNotes(n);
      if (t)  setTimerData(t);
      if (tk) setTasks(tk);
      setLoading(false);
    })();
  }, []);

  // ── STORAGE SAVE ───────────────────────────────────────────────────────────
  useEffect(() => { if (!loading) save(KEY_SECTIONS, sections); }, [sections, loading]);
  useEffect(() => { if (!loading) save(KEY_CHECKED,  checked);  }, [checked,  loading]);
  useEffect(() => { if (!loading) save(KEY_NOTES,    notes);    }, [notes,    loading]);
  useEffect(() => { if (!loading) save(KEY_TIMER,    timerData);}, [timerData,loading]);
  useEffect(() => { if (!loading) save(KEY_TASKS,    tasks);    }, [tasks,    loading]);

  // ── TIMER TICK ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTimer) {
      timerRef.current = setInterval(() => setTimerTick(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [activeTimer]);

  // ── HELPERS ────────────────────────────────────────────────────────────────
  const fmtTime = (s) => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };
  const fmtClock = (s) => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
    return h > 0
      ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
      : `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const toggle      = (sid, tid) => setChecked(p => ({ ...p, [`${sid}__${tid}`]: !p[`${sid}__${tid}`] }));
  const toggleTask  = (id) => setTasks(p => p.map(t => t.id===id ? {...t, done:!t.done} : t));
  const deleteTask  = (id) => setTasks(p => p.filter(t => t.id !== id));
  const saveNote    = (k, v) => setNotes(p => ({ ...p, [k]: v }));
  const showMotiv   = () => { setMotivation(MOTIVATION[Math.floor(Math.random()*MOTIVATION.length)]); setShowMotivation(true); };

  const exportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: "job-tracker",
      version: 1,
      sections,
      checked,
      notes,
      tasks,
      timerData,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const startTimer  = (topicId = GENERAL_TIMER_ID) => { if (activeTimer) stopTimer(); setActiveTimer({ topicId, startedAt: Date.now() }); };
  const stopTimer   = () => {
    if (!activeTimer) return;
    const elapsed = Math.floor((Date.now()-activeTimer.startedAt)/1000);
    const timerId = activeTimer.topicId || GENERAL_TIMER_ID;
    const dayKey  = `day__${new Date().toDateString()}__${timerId}`;
    setTimerData(prev => ({ ...prev, [timerId]:(prev[timerId]||0)+elapsed, [dayKey]:(prev[dayKey]||0)+elapsed }));
    setActiveTimer(null); setTimerTick(0);
  };
  const deleteTimerEntry = (topicId) => {
    const timerId = topicId || GENERAL_TIMER_ID;
    const dayKey = `day__${new Date().toDateString()}__${timerId}`;
    setTimerData(prev => { const n={...prev}; n[timerId]=Math.max(0,(n[timerId]||0)-(n[dayKey]||0)); delete n[dayKey]; return n; });
  };

  const addSection  = () => {
    if (!newSectionName.trim()) return;
    const id = "custom_"+Date.now();
    setSections(p => [...p, { id, label:newSectionName.trim(), emoji:"📌", color:"#A78BFA", custom:true, topics:[] }]);
    setNewSectionName(""); setShowAddSection(false); setActiveSection(id);
  };
  const addTopic    = () => {
    if (!newTopic.title.trim()) return;
    const id = "t_"+Date.now();
    setSections(p => p.map(s => s.id!==activeSection ? s : { ...s, topics:[...s.topics,{id,title:newTopic.title,desc:newTopic.desc,refs:newTopic.ref?[newTopic.ref]:[]}] }));
    setNewTopic({ title:"", desc:"", ref:"" }); setShowAddTopic(false);
  };
  const addTask     = () => {
    if (!newTask.trim()) return;
    setTasks(p => [...p, { id:Date.now(), text:newTask.trim(), done:false, date:new Date().toDateString() }]);
    setNewTask("");
  };
  const addTopicToToday = (topic) => {
    if (tasks.some(t => t.text===topic.title && t.date===new Date().toDateString())) return;
    setTasks(p => [...p, { id:Date.now(), text:topic.title, done:false, date:new Date().toDateString() }]);
  };
  const removeTopicFromToday = (topic) => {
    const today = new Date().toDateString();
    setTasks(p => p.filter(t => !(t.text===topic.title && t.date===today)));
  };
  const toggleTopicInToday = (topic) => {
    if (isInToday(topic)) {
      removeTopicFromToday(topic);
      return;
    }
    addTopicToToday(topic);
  };

  const updateTopicField = (secId, topicId, field, value) =>
    setSections(p => p.map(s => s.id!==secId ? s : { ...s, topics:s.topics.map(t => t.id!==topicId ? t : {...t,[field]:value}) }));
  const updateTopicRef = (secId, topicId, idx, value) =>
    setSections(p => p.map(s => s.id!==secId ? s : { ...s, topics:s.topics.map(t => { if(t.id!==topicId) return t; const refs=[...(t.refs||[])]; refs[idx]=value; return {...t,refs}; }) }));
  const addTopicRef = (secId, topicId) =>
    setSections(p => p.map(s => s.id!==secId ? s : { ...s, topics:s.topics.map(t => t.id!==topicId ? t : {...t,refs:[...(t.refs||[]),""]}) }));
  const removeTopicRef = (secId, topicId, idx) =>
    setSections(p => p.map(s => s.id!==secId ? s : { ...s, topics:s.topics.map(t => t.id!==topicId ? t : {...t,refs:(t.refs||[]).filter((_,i)=>i!==idx)}) }));


  // ── NEW HELPERS ────────────────────────────────────────────────────────────
  const deleteSection = (secId) => {
    if (sections.length <= 1) return;
    const nextSec = sections.find(s => s.id !== secId);
    setSections(p => p.filter(s => s.id !== secId));
    if (activeSection === secId) { setActiveSection(nextSec.id); setActiveTopic(null); }
  };

  // ── DERIVED ────────────────────────────────────────────────────────────────
  void timerTick;
  const liveElapsed = activeTimer ? Math.floor((Date.now()-activeTimer.startedAt)/1000) : 0;
  const activeS     = sections.find(s => s.id===activeSection) || sections[0];
  const totalDone   = sections.reduce((a,s) => a+s.topics.filter(t=>checked[`${s.id}__${t.id}`]).length, 0);
  const totalAll    = sections.reduce((a,s) => a+s.topics.length, 0);
  const totalPct    = totalAll ? Math.round(totalDone/totalAll*100) : 0;
  const allStudy    = Object.entries(timerData).filter(([k])=>!k.startsWith("day__")).reduce((a,[,v])=>a+v,0);
  const todayKey    = getDateKey(0);
  const todayTasks  = tasks.filter(t => t.date===todayKey);
  const secProg = (sec) => {
    const done = sec.topics.filter(t=>checked[`${sec.id}__${t.id}`]).length;
    return { done, total:sec.topics.length, pct:sec.topics.length ? Math.round(done/sec.topics.length*100) : 0 };
  };
  const isInToday = (topic) => tasks.some(t => t.text===topic.title && t.date===todayKey);
  const filteredTopics = searchQuery.trim()
    ? activeS.topics.filter(t=>t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : activeS.topics;

  const todaySessions = Object.entries(timerData)
    .filter(([k,v]) => k.startsWith(`day__${todayKey}__`) && v>0)
    .map(([k,secs]) => {
      const topicId=k.replace(`day__${todayKey}__`,"");
      const topic=topicId===GENERAL_TIMER_ID
        ? { id: GENERAL_TIMER_ID, title: "General Study Session" }
        : sections.flatMap(s=>s.topics).find(t=>t.id===topicId);
      const sec=topicId===GENERAL_TIMER_ID
        ? { emoji: "⏱", label: "General", color: "#E3B341" }
        : sections.find(s=>s.topics.some(t=>t.id===topicId));
      return { topicId, topic, sec, secs };
    }).filter(x=>x.topic);
  const liveInList = todaySessions.find(x=>x.topicId===activeTimer?.topicId);
  const allSessions = activeTimer && !liveInList
    ? [...todaySessions, { topicId:activeTimer.topicId, topic:activeTimer.topicId===GENERAL_TIMER_ID ? { id: GENERAL_TIMER_ID, title: "General Study Session" } : sections.flatMap(s=>s.topics).find(t=>t.id===activeTimer.topicId), sec:activeTimer.topicId===GENERAL_TIMER_ID ? { emoji: "⏱", label: "General", color: "#E3B341" } : sections.find(s=>s.topics.some(t=>t.id===activeTimer.topicId)), secs:liveElapsed, isLive:true }]
    : todaySessions.map(x => x.topicId===activeTimer?.topicId ? {...x,secs:x.secs+liveElapsed,isLive:true} : x);
  const todayTotal = allSessions.reduce((a,x)=>a+x.secs,0);
  const todayStudySeconds = todayTotal;
  const completedTodayCount = todayTasks.filter(t => t.done).length;
  const sectionStats = sections.map(sec => {
    const stats = secProg(sec);
    return { ...sec, ...stats };
  }).sort((a, b) => b.pct - a.pct);

  const dailyStudySeconds = Object.entries(timerData).reduce((acc, [key, value]) => {
    if (!key.startsWith("day__") || value <= 0) return acc;
    const dateKey = key.slice(5).split("__")[0];
    acc[dateKey] = (acc[dateKey] || 0) + value;
    return acc;
  }, {});

  const completedTaskDates = new Set(tasks.filter(t => t.done && t.date).map(t => t.date));
  const activeDateKeys = new Set([
    ...Object.keys(dailyStudySeconds).filter(k => dailyStudySeconds[k] > 0),
    ...completedTaskDates,
  ]);

  let streak = 0;
  while (activeDateKeys.has(getDateKey(-streak))) {
    streak += 1;
  }

  const weeklyStudy = Array.from({ length: 7 }, (_, idx) => {
    const offset = idx - 6;
    const dateKey = getDateKey(offset);
    return {
      dateKey,
      label: shortDayLabel(dateKey),
      seconds: dailyStudySeconds[dateKey] || 0,
      completedTasks: tasks.filter(t => t.date === dateKey && t.done).length,
    };
  });

  const bestDay = weeklyStudy.reduce((best, day) => day.seconds > best.seconds ? day : best, weeklyStudy[0]);
  const weekStudyTotal = weeklyStudy.reduce((sum, day) => sum + day.seconds, 0);
  const weekTaskDoneTotal = weeklyStudy.reduce((sum, day) => sum + day.completedTasks, 0);
  const longestSection = sectionStats[0];
  const nextSection = [...sectionStats]
    .filter(sec => sec.pct < 100)
    .sort((a, b) => (b.done / Math.max(b.total, 1)) - (a.done / Math.max(a.total, 1)))[0];
  const weeklyMaxSeconds = Math.max(...weeklyStudy.map(day => day.seconds), 1);

  if (loading) return <div style={{background:"#0D1117",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#8B949E",fontFamily:"sans-serif",fontSize:15}}>Loading your progress…</div>;

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="app">

      {/* ── TOP BAR ── */}
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-icon">🎯</span>
          <div>
            <div className="topbar-name">Nikhil</div>
            <div className="topbar-sub">Interview Prep · <b style={{color:activeS.color}}>{totalPct}%</b> · {totalDone}/{totalAll} topics</div>
          </div>
          {activeTimer && (
            <div className="recording-pill">
              <span className="rec-dot"/>
              <span>{fmtClock(liveElapsed)}</span>
            </div>
          )}
        </div>
        <nav className="topbar-nav">
  {[
    ["topics","📚 Topics"],
    ["today","📋 Today"],
    ["timer","⏱ Timer"],
    ["analytics","📊 Analytics"]
  ].map(([v,lbl]) => (
    <button
      key={v}
      className={`nav-btn${view===v?" active":""}`}
      style={view===v?{background:activeS.color}:{}}
      onClick={()=>setView(v)}
    >
      {lbl}
    </button>
  ))}
  <button className="mood-btn" onClick={showMotiv}>No Mood? 😮</button>
</nav>
      </header>

      {/* Global progress strip */}
      <div className="progress-track">
        <div className="progress-fill" style={{width:`${totalPct}%`,background:`linear-gradient(90deg,${activeS.color},#A371F7,#EC4899)`}}/>
      </div>

      {/* ── MOTIVATION MODAL ── */}
      {showMotivation && (
        <div className="modal-overlay" onClick={()=>setShowMotivation(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-big-emoji">💪</div>
            <p className="modal-quote">"{motivation}"</p>
            <button className="btn-another" onClick={()=>{setShowMotivation(false);showMotiv();}}>Another one →</button>
          </div>
        </div>
      )}

      <div className="body">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-inner">
            {sections.map(sec => {
              const {done,total,pct} = secProg(sec);
              const active = activeSection===sec.id;
              return (
                <div key={sec.id} className={`sidebar-item${active?" active":""}`}
                  style={{borderLeftColor:active?sec.color:"transparent"}}
                  onClick={()=>{setActiveSection(sec.id);setActiveTopic(null);setView("topics");}}>
                  <div className="sidebar-row">
                    <span className="sidebar-label">{sec.emoji} {sec.label}</span>
                    <div className="sidebar-right">
                      <span className={`sidebar-count${pct===100?" done":""}` }>{pct===100?"✓":`${done}/${total}`}</span>
                      <button className="btn-sec-del"
                        onClick={e=>{e.stopPropagation();if(window.confirm(`Delete "${sec.label}"?`))deleteSection(sec.id);}}>
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="mini-bar"><div className="mini-fill" style={{width:`${pct}%`,background:sec.color}}/></div>
                </div>
              );
            })}
          </div>
          <div className="sidebar-footer">
            <button className="btn-add-section" onClick={()=>setShowAddSection(true)}>+ Add Section</button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="content">

          {/* TODAY */}
          {view==="today" && (
            <div className="view-wrap">
              <div className="view-header">
                <h1 className="view-title">📋 Today's Focus</h1>
                <p className="view-sub">{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
              </div>
              <div className="input-row">
                <input className="text-input" value={newTask}
                  onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()}
                  placeholder="Add a task for today…" />
                <button className="btn-primary" style={{background:activeS.color}} onClick={addTask}>Add</button>
              </div>
              {todayTasks.length===0
                ? <div className="empty-state"><span>🌅</span><p>Nothing yet — add tasks or hit <strong>+</strong> on any topic in the list!</p></div>
                : <div className="item-list">
                    {todayTasks.map(task=>(
                      <div key={task.id} className={`list-item${task.done?" done":""}`}>
                        <button className={`check-box${task.done?" checked":""}`} onClick={()=>toggleTask(task.id)}>
                          {task.done&&"✓"}
                        </button>
                        <span className={`item-text${task.done?" strike":""}`}>{task.text}</span>
                        <button className="btn-icon-del" onClick={()=>deleteTask(task.id)}>×</button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* TIMER */}
          {view==="timer" && (
            <div className="timer-wrap">
              <div className="timer-inner">
                <div className={`clock-face${activeTimer?" active":""}`}>
                  <div className="clock-label">{activeTimer?"● RECORDING":"STUDY STOPWATCH"}</div>
                  <div className="clock-digits">{fmtClock(liveElapsed)}</div>
                  {activeTimer&&<div className="clock-topic">studying · <b>{activeTimer.topicId===GENERAL_TIMER_ID ? "General Study Session" : sections.flatMap(s=>s.topics).find(t=>t.id===activeTimer.topicId)?.title||"—"}</b></div>}
                </div>

                {!activeTimer ? <>
                  <p className="timer-prompt">Pick a topic, or just start a general study session</p>
                  <select id="timerSel" className="timer-select" defaultValue="">
                    <option value="">— no topic selected (general session) —</option>
                    {sections.map(sec=>(
                      <optgroup key={sec.id} label={`${sec.emoji} ${sec.label}`}>
                        {sec.topics.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <button className="btn-start" onClick={()=>{const v=document.getElementById("timerSel").value;startTimer(v || GENERAL_TIMER_ID);}}>▶  START</button>
                </> : <button className="btn-stop" onClick={stopTimer}>■  STOP</button>}

                <div className="sessions-hdr">
                  <span className="sessions-title">Today's Sessions</span>
                  {todayTotal>0&&<span className="sessions-total">{fmtTime(todayTotal)}</span>}
                </div>

                {allSessions.length===0
                  ? <div className="empty-state sm"><span>⏰</span><p>No sessions yet. Hit Start!</p></div>
                  : <div className="sessions-list">
                      {[...allSessions].sort((a,b)=>b.secs-a.secs).map(({topicId,topic,sec,secs,isLive})=>(
                        <div key={topicId} className={`session-card${isLive?" live":""}`}>
                          <div className="session-info">
                            <div className="session-sec" style={{color:sec?.color||"#8B949E"}}>{sec?.emoji} {sec?.label}</div>
                            <div className="session-name">{topic?.title}</div>
                          </div>
                          <div className="session-right">
                            <span className={`session-time${isLive?" live":""}`}>{fmtTime(secs)}{isLive&&<span className="live-dot"> ●</span>}</span>
                            {!isLive&&<button className="btn-del-session" onClick={()=>deleteTimerEntry(topicId)}>🗑</button>}
                          </div>
                        </div>
                      ))}
                    </div>
                }
                {allStudy>0&&(
                  <div className="alltime-bar">
                    <span>All-time total</span>
                    <span className="alltime-val">{fmtTime(allStudy+(activeTimer?liveElapsed:0))}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {view==="analytics" && (
            <div className="view-wrap">
              <div className="view-header analytics-header">
                <div>
                  <h1 className="view-title">📊 Progress Analytics</h1>
                  <p className="view-sub">See momentum, consistency, and what to attack next.</p>
                </div>
                <button className="btn-outline" onClick={exportBackup}>Export Backup</button>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Overall Progress</div>
                  <div className="stat-value">{totalPct}%</div>
                  <div className="stat-sub">{totalDone} of {totalAll} topics done</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Study Streak</div>
                  <div className="stat-value">{streak} day{streak===1?"":"s"}</div>
                  <div className="stat-sub">Counts study time or completed tasks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Today</div>
                  <div className="stat-value">{fmtTime(todayStudySeconds)}</div>
                  <div className="stat-sub">{completedTodayCount} task{completedTodayCount===1?"":"s"} completed today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">All-Time Study</div>
                  <div className="stat-value">{fmtTime(allStudy + (activeTimer ? liveElapsed : 0))}</div>
                  <div className="stat-sub">{todaySessions.length} tracked session{todaySessions.length===1?"":"s"} today</div>
                </div>
              </div>

              <div className="analytics-grid">
                <section className="panel-card">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Section Breakdown</div>
                      <div className="panel-sub">Your strongest areas and what still needs work</div>
                    </div>
                  </div>
                  <div className="section-progress-list">
                    {sectionStats.map(sec => (
                      <div key={sec.id} className="section-progress-row">
                        <div className="section-progress-top">
                          <span className="section-progress-name">{sec.emoji} {sec.label}</span>
                          <span className="section-progress-meta">{sec.done}/{sec.total} · {sec.pct}%</span>
                        </div>
                        <div className="prog-track analytics-track">
                          <div className="prog-fill" style={{ width: `${sec.pct}%`, background: sec.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel-card">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Last 7 Days</div>
                      <div className="panel-sub">Study time by day</div>
                    </div>
                    <div className="panel-badge">{fmtTime(weekStudyTotal)}</div>
                  </div>
                  <div className="week-chart">
                    {weeklyStudy.map(day => (
                      <div key={day.dateKey} className="week-bar-card">
                        <div className="week-bar-wrap">
                          <div
                            className="week-bar"
                            style={{ height: `${Math.max(10, Math.round(day.seconds / weeklyMaxSeconds * 100))}%` }}
                            title={`${day.label}: ${fmtTime(day.seconds)}`}
                          />
                        </div>
                        <div className="week-bar-time">{day.seconds > 0 ? fmtTime(day.seconds) : "0s"}</div>
                        <div className="week-bar-label">{day.label}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel-card">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Weekly Snapshot</div>
                      <div className="panel-sub">Quick read on your pace</div>
                    </div>
                  </div>
                  <div className="insight-list">
                    <div className="insight-row">
                      <span className="insight-k">Best study day</span>
                      <span className="insight-v">{bestDay?.seconds > 0 ? `${bestDay.label} · ${fmtTime(bestDay.seconds)}` : "No study time yet"}</span>
                    </div>
                    <div className="insight-row">
                      <span className="insight-k">Tasks finished this week</span>
                      <span className="insight-v">{weekTaskDoneTotal}</span>
                    </div>
                    <div className="insight-row">
                      <span className="insight-k">Top section</span>
                      <span className="insight-v">{longestSection ? `${longestSection.label} · ${longestSection.pct}%` : "—"}</span>
                    </div>
                    <div className="insight-row">
                      <span className="insight-k">Best next target</span>
                      <span className="insight-v">{nextSection ? `${nextSection.label} · ${nextSection.done}/${nextSection.total}` : "Everything is complete 🎉"}</span>
                    </div>
                  </div>
                </section>

                <section className="panel-card">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">Today&apos;s Queue</div>
                      <div className="panel-sub">What is on deck right now</div>
                    </div>
                    <div className="panel-badge">{todayTasks.length}</div>
                  </div>
                  {todayTasks.length === 0 ? (
                    <div className="empty-state sm"><span>🧭</span><p>Add topics with <strong>+</strong> to build today&apos;s plan.</p></div>
                  ) : (
                    <div className="analytics-task-list">
                      {todayTasks.map(task => (
                        <div key={task.id} className={`analytics-task-row${task.done ? " done" : ""}`}>
                          <span>{task.text}</span>
                          <span>{task.done ? "Done" : "Open"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* TOPICS LIST */}
          {view==="topics" && !activeTopic && (
            <div className="view-wrap">
              {/* Section header */}
              {(()=>{
                const {done,total,pct}=secProg(activeS);
                return(
                  <div className="sec-header">
                    <div className="sec-header-top">
                      <div className="sec-header-left">
                        <span className="sec-emoji">{activeS.emoji}</span>
                        <div>
                          <div className="sec-title">{activeS.label}</div>
                          <div className="sec-sub">{done} of {total} completed</div>
                        </div>
                      </div>
                      <div className="sec-header-right">
                        <button className="btn-outline" onClick={()=>setShowAddTopic(true)}>+ Topic</button>
                        <span className="sec-pct" style={{color:pct===100?"#3FB950":activeS.color}}>{pct}%</span>
                      </div>
                    </div>
                    <div className="prog-track"><div className="prog-fill" style={{width:`${pct}%`,background:activeS.color}}/></div>
                  </div>
                );
              })()}

              {/* Search */}
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input className="search-input" value={searchQuery}
                  onChange={e=>setSearchQuery(e.target.value)}
                  placeholder={`Search in ${activeS.label}…`} />
                {searchQuery&&<button className="search-clear" onClick={()=>setSearchQuery("")}>×</button>}
              </div>

              {/* Topics */}
              <div className="topics-list">
                {filteredTopics.length===0&&<div className="empty-state sm"><span>🔍</span><p>No matches for "{searchQuery}"</p></div>}
                {filteredTopics.map(topic=>{
                  const k=`${activeS.id}__${topic.id}`;
                  const isDone=!!checked[k];
                  const inToday=isInToday(topic);
                  const topicTime=timerData[topic.id]||0;
                  return(
                    <div key={topic.id} className={`topic-row${isDone?" done":""}`}
                      style={isDone?{background:`${activeS.color}18`,borderColor:`${activeS.color}40`}:{}}>
                      <button className="topic-check"
                        style={isDone?{background:activeS.color,borderColor:activeS.color}:{}}
                        onClick={()=>toggle(activeS.id,topic.id)}>
                        {isDone&&"✓"}
                      </button>
                      <span className={`topic-title${isDone?" struck":""}`} onClick={()=>setActiveTopic(topic)}>
                        {topic.title}
                      </span>
                      {topicTime>0&&<span className="topic-time">⏱ {fmtTime(topicTime)}</span>}
                      <button
                        className={`btn-today-toggle${inToday?" in-today":""}`}
                        title={inToday?"Remove from Today":"Add to Today"}
                        onClick={()=>toggleTopicInToday(topic)}>
                        {inToday?"✓":"+"}
                      </button>
                      <button className="btn-arrow" onClick={()=>setActiveTopic(topic)}>›</button>
                    </div>
                  );
                })}
              </div>

              {secProg(activeS).pct===100&&activeS.topics.length>0&&(
                <div className="done-banner">
                  <span>🎉</span>
                  <span>Section complete — you crushed it!</span>
                </div>
              )}
            </div>
          )}

          {/* TOPIC DETAIL */}
          {view==="topics" && activeTopic && (
            <div className="detail-wrap">
              <div className="detail-topbar">
                <button className="btn-back" onClick={()=>setActiveTopic(null)}>← {activeS.label}</button>
                <button className="btn-mark-done"
                  style={{background:checked[`${activeS.id}__${activeTopic.id}`]?"#238636":activeS.color}}
                  onClick={()=>toggle(activeS.id,activeTopic.id)}>
                  {checked[`${activeS.id}__${activeTopic.id}`]?"✓ Completed":"Mark as Done"}
                </button>
              </div>

              <div className="detail-tag" style={{color:activeS.color}}>{activeS.emoji} {activeS.label}</div>

              <input className="detail-title" value={activeTopic.title}
                onChange={e=>{updateTopicField(activeS.id,activeTopic.id,"title",e.target.value);setActiveTopic(p=>({...p,title:e.target.value}));}} />

              {timerData[activeTopic.id]>0&&(
                <div className="detail-time-badge">⏱ {fmtTime(timerData[activeTopic.id])} studied</div>
              )}

              <div className="detail-field">
                <label className="field-label">Description</label>
                <textarea className="field-textarea tall"
                  value={activeTopic.desc||""}
                  onChange={e=>{updateTopicField(activeS.id,activeTopic.id,"desc",e.target.value);setActiveTopic(p=>({...p,desc:e.target.value}));}}
                  placeholder="What's this topic about? Key concepts, interview tips, gotchas…" />
              </div>

              <div className="detail-field">
                <div className="field-header">
                  <label className="field-label">References</label>
                  <button className="btn-sm-action"
                    onClick={()=>{addTopicRef(activeS.id,activeTopic.id);setActiveTopic(p=>({...p,refs:[...(p.refs||[]),""]}))}}>
                    + Add Link
                  </button>
                </div>
                {(activeTopic.refs||[]).length===0&&<p className="field-empty">No references yet — add a link above.</p>}
                {(activeTopic.refs||[]).map((ref,i)=>(
                  <div key={i} className="ref-row">
                    <input className="ref-input" value={ref} placeholder="https://…"
                      onChange={e=>{updateTopicRef(activeS.id,activeTopic.id,i,e.target.value);setActiveTopic(p=>{const refs=[...(p.refs||[])];refs[i]=e.target.value;return{...p,refs};});}} />
                    {ref&&<a href={ref} target="_blank" rel="noreferrer" className="ref-open">🔗</a>}
                    <button className="btn-rm" onClick={()=>{removeTopicRef(activeS.id,activeTopic.id,i);setActiveTopic(p=>({...p,refs:(p.refs||[]).filter((_,j)=>j!==i)}));}}>×</button>
                  </div>
                ))}
              </div>

              <div className="detail-field">
                <label className="field-label">My Notes</label>
                <textarea className="field-textarea"
                  value={notes[`${activeS.id}__${activeTopic.id}`]||""}
                  onChange={e=>saveNote(`${activeS.id}__${activeTopic.id}`,e.target.value)}
                  placeholder="Your personal notes — key insights, what tripped you up, links to videos…" />
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ADD SECTION MODAL */}
      {showAddSection&&(
        <div className="modal-overlay" onClick={()=>setShowAddSection(false)}>
          <div className="modal-box" style={{maxWidth:380}} onClick={e=>e.stopPropagation()}>
            <h2>New Section</h2>
            <input value={newSectionName} onChange={e=>setNewSectionName(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addSection()} placeholder="e.g. Agentic AI, Certifications…" />
            <div className="modal-actions">
              <button className="btn-ghost" onClick={()=>setShowAddSection(false)}>Cancel</button>
              <button className="btn-primary" style={{background:activeS.color}} onClick={addSection}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TOPIC MODAL */}
      {showAddTopic&&(
        <div className="modal-overlay" onClick={()=>setShowAddTopic(false)}>
          <div className="modal-box" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <h2>Add Topic — {activeS.label}</h2>
            <input value={newTopic.title} onChange={e=>setNewTopic(p=>({...p,title:e.target.value}))} placeholder="Topic title…" />
            <textarea value={newTopic.desc} onChange={e=>setNewTopic(p=>({...p,desc:e.target.value}))} placeholder="Description / what to learn…" />
            <input value={newTopic.ref} onChange={e=>setNewTopic(p=>({...p,ref:e.target.value}))} placeholder="Reference URL (optional)…" />
            <div className="modal-actions">
              <button className="btn-ghost" onClick={()=>setShowAddTopic(false)}>Cancel</button>
              <button className="btn-primary" style={{background:activeS.color}} onClick={addTopic}>Add Topic</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}