// src/App.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { Share2, Copy, Eye, Clock, Link as LinkIcon, Trash2, Code, FileText, Lock, Search, X } from "lucide-react";
import CryptoJS from "crypto-js";


// src/realmClient.js
import * as Realm from "realm-web";

const APP_ID = "lokit-zfcjxkj"; // e.g., "myapp-abcde"
const DB_NAME = "lokit"; // e.g., "pastebin"
const COLLECTION_NAME = "text_share"; // e.g., "snippets"

/*
Security notes:
- Use Anonymous auth for frictionless public access, but strictly lock down rules.
- Configure rules in App Services so:
  - insertOne: allowed, with strict schema and size limits.
  - findOne/find: only allow read when:
      isPrivate == false AND (expiry == 0 OR expiry > now)
      If document.passwordTag != null, the query must include matching passwordTag.
      Also allow reading private docs only if the user is owner (if you implement authentication).
  - updateOne: allow only $inc on views by id.
  - deleteOne: disallow or restrict by owner.
*/

const app = new Realm.App({ id: APP_ID });

export async function getMongo() {
  if (!app.currentUser) {
    await app.logIn(Realm.Credentials.anonymous());
  }
  const mongodb = app.currentUser.mongoClient("mongodb-atlas");
  const db = mongodb.db(DB_NAME);
  const snippets = db.collection(COLLECTION_NAME);
  return { snippets, user: app.currentUser };
}



const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function generateShortCode(len = 4) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export function isValidShortCode(code) {
  return /^[a-z0-9]{4}$/.test(code);
}

// src/crypto.js

// URL-safe Base64
function base64Url(strB64) {
  return strB64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function sha256Base64Url(input) {
  const hash = CryptoJS.SHA256(input);
  const b64 = CryptoJS.enc.Base64.stringify(hash);
  return base64Url(b64);
}

// Derive deterministic tag from password and salt (here, salt = snippet code)
export function derivePasswordTag(password, code) {
  return sha256Base64Url(`${code}:${password}`);
}

export function encryptContent(content, password) {
  return CryptoJS.AES.encrypt(content, password).toString();
}

export function decryptContent(ciphertext, password) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, password);
  const text = bytes.toString(CryptoJS.enc.Utf8);
  return text;
}


const EXPIRY_OPTIONS = [
  { label: "1 Hour", value: 1 },
  { label: "24 Hours", value: 24 },
  { label: "7 Days", value: 168 },
  { label: "30 Days", value: 720 },
  { label: "Never", value: 0 },
];

const SYNTAX_OPTIONS = [
  { label: "Plain Text", value: "text" },
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "Markdown", value: "markdown" },
];

export default function App() {
  // Create state
  const [title, setTitle] = useState("");
  const [syntax, setSyntax] = useState("text");
  const [expiry, setExpiry] = useState(24);
  const [password, setPassword] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [text, setText] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [createdCode, setCreatedCode] = useState("");

  // Retrieve state
  const [lookupCode, setLookupCode] = useState("");
  const [lookupPassword, setLookupPassword] = useState("");
  const [fetched, setFetched] = useState(null); // {title, content, syntax, createdAt, views, expiry, protected}
  const [isLoadingFetch, setIsLoadingFetch] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  // Local list of my created snippets (optional UX)
  const [myCodes, setMyCodes] = useState(() => {
    const saved = localStorage.getItem("myCodes");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("myCodes", JSON.stringify(myCodes));
  }, [myCodes]);

  const getTimeRemaining = (expiryTs) => {
    if (expiryTs === 0) return "Never expires";
    const now = Date.now();
    const remaining = expiryTs - now;
    if (remaining <= 0) return "Expired";
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
    const minutes = Math.floor(remaining / (1000 * 60));
    return `${minutes} minute${minutes > 1 ? "s" : ""} remaining`;
  };

  const shareText = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to share");
      return;
    }
    setIsSharing(true);
    try {
      // Generate short code (length 4, [a-z0-9])
      let code;
      // Optional retry loop to reduce collision likelihood
      for (let i = 0; i < 5; i++) {
        code = generateShortCode(4);
        // Optionally check existence to avoid collision
        const { snippets } = await getMongo();
        const existing = await snippets.findOne({ code });
        if (!existing) break;
        code = null;
      }
      if (!code) {
        toast.error("Failed to allocate unique code, please try again");
        setIsSharing(false);
        return;
      }

      const now = Date.now();
      const expiryTime = expiry === 0 ? 0 : now + expiry * 60 * 60 * 1000;

      // Prepare stored content
      const hasPassword = !!password.trim();
      const passwordTag = hasPassword ? derivePasswordTag(password.trim(), code) : null;
      const storedContent = hasPassword ? encryptContent(text, password.trim()) : text;

      const doc = {
        code, // short id used for lookup
        title: (title || "Untitled").trim(),
        content: storedContent,
        syntax,
        expiry: expiryTime,
        isPrivate: !!isPrivate,
        passwordTag, // only a tag; content encrypted if password provided
        createdAt: now,
        views: 0,
      };

      const { snippets } = await getMongo();
      await snippets.insertOne(doc);

      const link = `${window.location.origin}/share/${code}`;
      setGeneratedLink(link);
      setCreatedCode(code);
      setMyCodes((prev) => [...new Set([code, ...prev])]);

      // Reset form minimal
      setText("");
      setPassword("");
      setIsPrivate(false);
      toast.success("Text shared successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to share");
    } finally {
      setIsSharing(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(createdCode);
      toast.success("code copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // Fetch by code with optional password
  const fetchByCode = async () => {
    const code = lookupCode.trim();
    if (!isValidShortCode(code)) {
      toast.error("Enter a valid 4-char code (lowercase letters and digits)");
      return;
    }
    setIsLoadingFetch(true);
    setFetched(null);
    try {
      const { snippets } = await getMongo();
      const filter = { code };

      // If password provided, include tag in the query so rules allow the read
      const pass = lookupPassword.trim();
      if (pass) {
        filter.passwordTag = derivePasswordTag(pass, code);
      }

      const now = Date.now();
      // The rules should already enforce expiry, but also check client-side
      const doc = await snippets.findOne(filter);

      if (!doc) {
        toast.error("Not found or password required/invalid");
        return;
      }

      if (doc.expiry !== 0 && doc.expiry < now) {
        toast.error("This snippet has expired");
        return;
      }

      // Decrypt content if protected
      let contentOut = doc.content;
      if (doc.passwordTag) {
        if (!pass) {
          toast.error("Password required");
          return;
        }
        try {
          contentOut = decryptContent(doc.content, pass);
          if (!contentOut) {
            toast.error("Invalid password");
            return;
          }
        } catch {
          toast.error("Invalid password");
          return;
        }
      }

      // increment views
      await snippets.updateOne({ code }, { $inc: { views: 1 } });

      if (contentOut) {
        setFetched({ ...doc, content: contentOut });
        setIsContentModalOpen(true);
        setLookupCode("");
        setLookupPassword("");
      } else {
        setFetched(doc);
      }
    } catch (e) {
      console.error(e);
      toast.error("Fetch failed");
    } finally {
      setIsLoadingFetch(false);
    }
  };

  // Optional: quick delete if needed for your own codes (requires appropriate rules!)
  const deleteByCode = async (code) => {
    try {
      const { snippets } = await getMongo();
      await snippets.deleteOne({ code });
      setMyCodes((prev) => prev.filter((c) => c !== code));
      toast.success("Deleted");
    } catch (e) {
      console.error(e);
      toast.error("Delete failed (check rules)");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Toaster />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Text Sharing</h1>
          <p className="text-slate-600">
            Create and retrieve snippets using a 4-character code. Optional password encryption and auto-expiry.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
              <h3 className="font-semibold text-slate-900 mb-6">Create New Share</h3>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title (optional)</label>
                  <input
                    type="text"
                    placeholder="Enter a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Syntax Highlighting</label>
                  <select
                    value={syntax}
                    onChange={(e) => setSyntax(e.target.value)}
                    className="input-field w-full border rounded px-3 py-2"
                  >
                    {SYNTAX_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your text, code, or notes here..."
                  className="textarea-field h-64 font-mono text-sm w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expires In</label>
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(parseInt(e.target.value))}
                    className="input-field w-full border rounded px-3 py-2"
                  >
                    {EXPIRY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password (optional)</label>
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="rounded border-slate-300 text-primary-600"
                    />
                    <span className="text-sm text-slate-700">Private</span>
                  </label>
                </div>
              </div>

              <button
                onClick={shareText}
                disabled={isSharing || !text.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
              >
                {isSharing ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                Share Text
              </button>

              {generatedLink && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Share code Generated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={createdCode}
                      readOnly
                      className="input-field flex-1 font-mono text-sm border rounded px-3 py-2"
                    />
                    <button onClick={copyLink} className="btn-secondary border rounded px-3 py-2">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {/* {createdCode && (
                    <div className="mt-2 text-sm text-slate-700">
                      Code: <span className="font-mono">{createdCode}</span> (shareable)
                    </div>
                  )} */}
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar: Retrieve + My Codes */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Retrieve by Code</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Enter Code (4 chars, a-z0-9)</label>
                  <input
                    type="text"
                    placeholder="e.g., a3x9"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value.toLowerCase())}
                    maxLength={4}
                    className="input-field w-full border rounded px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password (if protected)</label>
                  <input
                    type="password"
                    placeholder="Password if required"
                    value={lookupPassword}
                    onChange={(e) => setLookupPassword(e.target.value)}
                    className="input-field w-full border rounded px-3 py-2"
                  />
                </div>
                <button
                  onClick={fetchByCode}
                  disabled={isLoadingFetch || !isValidShortCode(lookupCode)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white rounded px-4 py-2 disabled:opacity-60"
                >
                  {isLoadingFetch ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Get Content
                </button>
              </div>

              {fetched && (
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 text-sm truncate">{fetched.title}</h4>
                    <span className="text-xs text-slate-500">Code: {fetched.code}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {fetched.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Code className="h-3 w-3" />
                      {fetched.syntax}
                    </span>
                    {fetched.protected && (
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Protected
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(fetched.expiry)}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsContentModalOpen(true)}
                    className="w-full text-center bg-white p-3 rounded border text-sm hover:bg-slate-50"
                  >
                    View Content
                  </button>
                </div>
              )}
            </div>

            {/* My Codes */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">My Codes</h3>
                <span className="text-sm text-slate-500">{myCodes.length} items</span>
              </div>
              {myCodes.length ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {myCodes.map((c) => (
                    <div key={c} className="p-2 border rounded flex items-center justify-between">
                      <span className="font-mono text-sm">{c}</span>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs text-blue-600"
                          onClick={() => setLookupCode(c)}
                          title="Load in retrieve box"
                        >
                          Use
                        </button>
                        <button
                          className="p-1 text-slate-400 hover:text-red-600"
                          onClick={() => deleteByCode(c)}
                          title="Delete (if allowed by rules)"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No codes yet</p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Features</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-slate-600">Auto-expiring links</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-slate-600">Password protection (client-side encryption)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-purple-600" />
                  <span className="text-slate-600">Syntax selection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-orange-600" />
                  <span className="text-slate-600">View tracking</span>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 text-sm mb-1">Security Notes</h4>
                  <p className="text-xs text-blue-700">
                    Uses MongoDB Atlas via Realm Web SDK. Configure Rules to restrict reads/writes, enforce expiry, and only allow views increment updates. Password-protected content is AES-encrypted client-side and requires the correct password to decrypt.
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    The 4-character code contains only lowercase letters and digits. Keep snippets short; consider adding rate limiting and size limits in App Services.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Content Modal */}
      {isContentModalOpen && fetched && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full m-4 flex flex-col"
          >
            <div className="p-5 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="font-semibold text-lg text-slate-900 truncate pr-4">{fetched.title}</h3>
              <button onClick={() => setIsContentModalOpen(false)} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <pre className="bg-slate-100 p-4 rounded-lg border border-slate-200 overflow-x-auto text-sm font-mono">
                <code>{fetched.content}</code>
              </pre>
            </div>
            <div className="p-5 border-t flex justify-between items-center bg-slate-50 rounded-b-xl">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><Code className="h-3.5 w-3.5" />{fetched.syntax}</span>
                {fetched.protected && <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" />Protected</span>}
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{getTimeRemaining(fetched.expiry)}</span>
                <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{fetched.views} views</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-slate-600">Code: {fetched.code}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(fetched.content);
                    toast.success("Content copied to clipboard!");
                  }} 
                  className="btn-secondary bg-blue-600 text-white hover:bg-blue-700 rounded-md px-4 py-2 flex items-center gap-2 text-sm font-semibold transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}




