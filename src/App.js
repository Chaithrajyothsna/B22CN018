// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { nanoid } from "nanoid";
// import { z } from "zod";
// import {
//   Copy,
//   Link as LinkIcon,
//   Trash2,
//   QrCode,
//   BarChart2,
//   Check,
//   ExternalLink,
//   RefreshCw,
// } from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
// import QRCode from "qrcode";
// import { toast } from "sonner";

// function Button({ children, className = "", ...props }) {
//   return (
//     <button
//       {...props}
//       className={
//         "px-3 py-2 rounded-lg border shadow-sm hover:bg-gray-100 transition " +
//         className
//       }
//     >
//       {children}
//     </button>
//   );
// }

// function Card({ children, className = "" }) {
//   return (
//     <div className={"rounded-2xl border bg-white shadow-sm " + className}>
//       {children}
//     </div>
//   );
// }

// function Input({ className = "", ...props }) {
//   return (
//     <input
//       {...props}
//       className={
//         "w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring " +
//         className
//       }
//     />
//   );
// }

// function Label({ children }) {
//   return <label className="text-sm font-medium">{children}</label>;
// }

// function Badge({ children }) {
//   return (
//     <span className="px-2 py-1 text-xs bg-gray-200 rounded-lg">{children}</span>
//   );
// }

// const STORAGE_KEY = "urlshort.links.v1";

// const urlSchema = z
//   .string()
//   .trim()
//   .min(1, { message: "URL is required" })
//   .transform((v) => ensureProtocol(v))
//   .pipe(z.string().url({ message: "Enter a valid URL" }));

// const aliasSchema = z.string().trim().regex(/^[a-zA-Z0-9-_]{3,40}$/i, {
//   message: "Alias must be 3–40 chars: letters, numbers, - or _",
// });

// function ensureProtocol(url) {
//   if (!/^https?:\/\//i.test(url)) return `https://${url}`;
//   return url;
// }

// function nowISO() {
//   return new Date().toISOString();
// }

// function loadLinks() {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (!raw) return [];
//     const parsed = JSON.parse(raw);
//     if (Array.isArray(parsed)) return parsed;
//     return [];
//   } catch {
//     return [];
//   }
// }

// function saveLinks(links) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
// }

// function useLocalLinks() {
//   const [links, setLinks] = useState(() => loadLinks());
//   useEffect(() => saveLinks(links), [links]);
//   return [links, setLinks];
// }

// function makeCode(existing, customAlias) {
//   if (customAlias) return customAlias;
//   let code = nanoid(7);
//   while (existing.some((l) => l.code.toLowerCase() === code.toLowerCase())) {
//     code = nanoid(7);
//   }
//   return code;
// }

// function useMiniRouter() {
//   const [route, setRoute] = useState(() =>
//     window.location.hash.startsWith("#/")
//       ? window.location.hash.slice(2)
//       : ""
//   );
//   useEffect(() => {
//     const onHash = () =>
//       setRoute(
//         window.location.hash.startsWith("#/")
//           ? window.location.hash.slice(2)
//           : ""
//       );
//     window.addEventListener("hashchange", onHash);
//     return () => window.removeEventListener("hashchange", onHash);
//   }, []);
//   return route;
// }

// function useQRCode(text) {
//   const [dataUrl, setDataUrl] = useState("");
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         if (!text) return setDataUrl("");
//         const url = await QRCode.toDataURL(text, { margin: 1, width: 300 });
//         if (alive) setDataUrl(url);
//       } catch (e) {
//         console.error(e);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [text]);
//   return dataUrl;
// }

// export default function App() {
//   const [links, setLinks] = useLocalLinks();
//   const route = useMiniRouter();

//   useEffect(() => {
//     if (!route) return;
//     const record = links.find(
//       (l) => l.code.toLowerCase() === route.toLowerCase()
//     );
//     if (record) {
//       setLinks((prev) =>
//         prev.map((l) =>
//           l.code === record.code
//             ? { ...l, clicks: (l.clicks || 0) + 1, lastVisited: nowISO() }
//             : l
//         )
//       );
//       window.location.replace(record.longUrl);
//     } else {
//       toast.error("Short link not found.");
//     }
//   }, [route, links, setLinks]);

//   if (route) {
//     return (
//       <div className="min-h-screen grid place-items-center p-6">
//         <Card className="p-6">
//           <h2 className="font-bold text-xl">Redirecting…</h2>
//           <p className="text-sm text-gray-600">
//             If this page doesn't redirect, the short code may be invalid.
//           </p>
//           <p className="mt-2 text-sm">Code: {route}</p>
//         </Card>
//       </div>
//     );
//   }

//   return <Dashboard links={links} setLinks={setLinks} />;
// }

// function Dashboard({ links, setLinks }) {
//   const [url, setUrl] = useState("");
//   const [alias, setAlias] = useState("");
//   const [filter, setFilter] = useState("");
//   const urlInputRef = useRef(null);

//   const filtered = useMemo(() => {
//     const q = filter.trim().toLowerCase();
//     if (!q) return links;
//     return links.filter((l) =>
//       [l.code, l.longUrl, l.note || ""].some((f) =>
//         f.toLowerCase().includes(q)
//       )
//     );
//   }, [filter, links]);

//   const base = typeof window !== "undefined" ? `${window.location.origin}/#/` : "";

//   function createLink(e) {
//     e.preventDefault();
//     const parsedUrl = urlSchema.safeParse(url);
//     if (!parsedUrl.success) {
//       toast.error(parsedUrl.error.issues[0].message);
//       return;
//     }
//     let custom = alias.trim();
//     if (custom) {
//       const a = aliasSchema.safeParse(custom);
//       if (!a.success) {
//         toast.error(a.error.issues[0].message);
//         return;
//       }
//       if (links.some((l) => l.code.toLowerCase() === custom.toLowerCase())) {
//         toast.error("Alias already in use");
//         return;
//       }
//     }
//     const code = makeCode(links, custom || undefined);
//     const rec = {
//       id: nanoid(),
//       code,
//       longUrl: parsedUrl.data,
//       createdAt: nowISO(),
//       clicks: 0,
//       lastVisited: null,
//       note: "",
//     };
//     setLinks([rec, ...links]);
//     setUrl("");
//     setAlias("");
//     urlInputRef.current?.focus();
//     toast.success("Short link created");
//   }

//   function removeLink(code) {
//     setLinks(links.filter((l) => l.code !== code));
//     toast("Deleted");
//   }

//   function copy(text) {
//     navigator.clipboard.writeText(text).then(() => toast.success("Copied"));
//   }

//   return (
//     <div className="max-w-3xl mx-auto p-6">
//       <Card className="p-6 mb-6">
//         <h2 className="text-xl font-bold mb-2">Create a short link</h2>
//         <form onSubmit={createLink} className="flex flex-col gap-3">
//           <div>
//             <Label>Destination URL</Label>
//             <Input
//               ref={urlInputRef}
//               value={url}
//               onChange={(e) => setUrl(e.target.value)}
//               placeholder="https://example.com"
//             />
//           </div>
//           <div>
//             <Label>Custom alias (optional)</Label>
//             <Input
//               value={alias}
//               onChange={(e) => setAlias(e.target.value)}
//               placeholder="e.g. my-link"
//             />
//           </div>
//           <Button type="submit">Shorten</Button>
//         </form>
//       </Card>

//       {filtered.length === 0 ? (
//         <p className="text-center text-gray-500">No links yet. Create one!</p>
//       ) : (
//         <div className="space-y-4">
//           {filtered.map((l) => (
//             <Row
//               key={l.id}
//               base={base}
//               record={l}
//               onCopy={copy}
//               onDelete={() => removeLink(l.code)}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function Row({ base, record, onCopy, onDelete }) {
//   const short = base + record.code;
//   const qr = useQRCode(short);
//   const [copied, setCopied] = useState(false);

//   function handleCopy() {
//     onCopy(short);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1200);
//   }

//   return (
//     <Card className="p-4">
//       <div className="flex justify-between items-center">
//         <div>
//           <a href={short} className="font-medium text-blue-600 hover:underline">
//             {short}
//           </a>
//           <p className="text-sm text-gray-600 truncate max-w-md">
//             {record.longUrl}
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button onClick={handleCopy}>
//             {copied ? <Check size={16} /> : <Copy size={16} />}
//           </Button>
//           <Button as="a" href={record.longUrl} target="_blank">
//             <ExternalLink size={16} />
//           </Button>
//           {qr && (
//             <img src={qr} alt="QR" className="w-12 h-12 border rounded-lg" />
//           )}
//           <Button onClick={() => onDelete(record.code)}>
//             <Trash2 size={16} />
//           </Button>
//         </div>
//       </div>
//       <div className="text-xs text-gray-500 mt-2">
//         {record.clicks} clicks • Created{" "}
//         {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
//       </div>
//     </Card>
//   );
// }

import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";

function App() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [urls, setUrls] = useState(() => {
    const saved = localStorage.getItem("urls");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever urls change
  useEffect(() => {
    localStorage.setItem("urls", JSON.stringify(urls));
  }, [urls]);

  // Handle redirect if visiting a short link
  useEffect(() => {
    const hash = window.location.hash.replace("#/", "");
    if (hash) {
      const match = urls.find((u) => u.alias === hash);
      if (match) {
        // Update visits
        setUrls((prev) =>
          prev.map((u) =>
            u.alias === hash
              ? { ...u, visits: u.visits + 1, lastVisited: new Date().toISOString() }
              : u
          )
        );
        window.location.href = match.url;
      }
    }
  }, []); 

  const shorten = () => {
    if (!url.trim()) return;
    const newAlias = alias.trim() || nanoid(6);
    const shortUrl = `${window.location.origin}/#/${newAlias}`;

    if (urls.some((u) => u.alias === newAlias)) {
      alert("Alias already exists! Try another one.");
      return;
    }

    const newEntry = {
      url,
      alias: newAlias,
      shortUrl,
      created: new Date().toISOString(),
      visits: 0,
      lastVisited: null,
    };
    setUrls([...urls, newEntry]);
    setUrl("");
    setAlias("");
  };

  // Delete a short link
  const deleteLink = (alias) => {
    setUrls(urls.filter((u) => u.alias !== alias));
  };

  // Copy short link
  const copyLink = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    alert("Copied: " + shortUrl);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">🔗 URL Shortener</h1>

      {/* Input Form */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg mb-8">
        <input
          type="text"
          placeholder="Enter a long URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />
        <input
          type="text"
          placeholder="Custom alias (optional)"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />
        <button
          onClick={shorten}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition"
        >
          Shorten URL
        </button>
      </div>

      {/* Links Table */}
      <div className="w-full max-w-3xl">
        {urls.length === 0 ? (
          <p className="text-gray-600 text-center">No links created yet.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3">Short URL</th>
                  <th className="p-3">Original</th>
                  <th className="p-3 text-center">Visits</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((u) => (
                  <tr key={u.alias} className="border-t">
                    <td className="p-3 text-blue-600 underline">
                      <a href={u.shortUrl} target="_blank" rel="noreferrer">
                        {u.shortUrl}
                      </a>
                    </td>
                    <td className="p-3 truncate max-w-xs">{u.url}</td>
                    <td className="p-3 text-center">{u.visits}</td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => copyLink(u.shortUrl)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => deleteLink(u.alias)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
