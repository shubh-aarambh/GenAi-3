"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Send, Sparkles, X, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [collectionName, setCollectionName] = useState<string | null>(null);
    const [messages, setMessages] = useState<{role: "user" | "assistant", content: string}[]>([]);
    const [input, setInput] = useState("");
    const [chatting, setChatting] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setCollectionName(data.collectionName);
                setMessages([{ role: "assistant", content: "I've processed your document. Ask me anything about it, and I will generate precise answers strictly grounded in the text." }]);
            } else {
                alert("Upload failed: " + data.error);
            }
        } catch (error) {
            alert("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !collectionName) return;
        
        const userQuery = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userQuery }]);
        setChatting(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: userQuery, collectionName })
            });
            const data = await res.json();
            
            if (data.success) {
                setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: "Error: " + data.error }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Connection error." }]);
        } finally {
            setChatting(false);
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, chatting]);

    return (
        <main className="min-h-screen w-full text-white relative font-sans selection:bg-cyan-500/30">
            {/* Texture & Background */}
            <div className="noise-overlay"></div>
            <div className="cinematic-bg">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
                <div className="orb orb-4"></div>
            </div>

            <div className="max-w-4xl mx-auto h-screen flex flex-col relative z-10 p-4 md:p-8">
                
                {/* Dynamic Header Area */}
                <motion.div layout className="flex flex-col items-center justify-center w-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]" style={{ marginTop: collectionName ? "0" : "15vh" }}>
                    
                    {/* Logo & Title */}
                    <motion.div layoutId="logo" className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl ultra-glass flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 opacity-20"></div>
                            <Sparkles className="w-6 h-6 text-cyan-300 relative z-10" />
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-white/90">
                            Notebook<span className="text-gradient font-bold">LM</span>
                        </h1>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {!collectionName ? (
                            <motion.div 
                                key="upload-center"
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                transition={{ duration: 0.5 }}
                                className="w-full max-w-lg ultra-glass rounded-[2rem] p-8 flex flex-col items-center text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 blur-sm"></div>
                                
                                <h2 className="text-xl font-medium text-white/80 mb-2">Initialize RAG Engine</h2>
                                <p className="text-white/40 text-sm mb-8">Upload a PDF to vectorize and index its contents.</p>

                                <label className="w-full h-48 rounded-2xl border border-dashed border-white/20 hover:border-cyan-500/50 hover:bg-white/[0.02] transition-all duration-500 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="w-16 h-16 rounded-full ultra-glass flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(34,211,238,0.1)] group-hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]">
                                        <Upload className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <span className="font-medium text-white/70 group-hover:text-white transition-colors">Select Document</span>
                                    <span className="text-xs text-white/30 mt-1 font-mono">.pdf</span>
                                    <input type="file" className="hidden" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                </label>

                                <AnimatePresence>
                                    {file && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            className="w-full overflow-hidden"
                                        >
                                            <div className="ultra-glass rounded-xl p-3 flex items-center gap-4 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                                                <div className="p-2 rounded-lg bg-cyan-500/10">
                                                    <FileText className="w-5 h-5 text-cyan-400" />
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className="text-sm font-medium text-white/90 truncate">{file.name}</p>
                                                    <p className="text-[11px] text-white/40 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                                <button onClick={() => setFile(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button 
                                    onClick={handleUpload}
                                    disabled={!file || uploading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full mt-6 py-4 rounded-xl bg-white text-black font-semibold disabled:opacity-30 disabled:bg-white/10 disabled:text-white/50 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:shadow-none hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                                >
                                    {uploading ? (
                                        <>
                                            <Activity className="w-5 h-5 animate-pulse text-cyan-500" />
                                            <span>Vectorizing...</span>
                                        </>
                                    ) : (
                                        "Index & Begin"
                                    )}
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="active-header"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full ultra-glass rounded-2xl py-3 px-5 flex flex-col md:flex-row items-center justify-between gap-4 border border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                                        <Activity size={14} className="text-cyan-400 animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Active Context</p>
                                        <p className="text-sm font-medium text-white/90 truncate max-w-[200px] md:max-w-[400px]">{file?.name}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setCollectionName(null); setFile(null); setMessages([]); }}
                                    className="text-xs px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white relative z-10"
                                >
                                    Disconnect
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Chat Interface */}
                <AnimatePresence>
                    {collectionName && (
                        <motion.div 
                            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            className="flex-1 flex flex-col min-h-0 mt-6 relative"
                        >
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto pb-4 px-2 space-y-8 hide-scrollbar">
                                {messages.map((msg, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                                    >
                                        <div className="flex items-end gap-3 max-w-[85%]">
                                            {msg.role === "assistant" && (
                                                <div className="w-8 h-8 rounded-xl ultra-glass flex items-center justify-center flex-shrink-0 mb-1 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                                                    <Sparkles size={14} className="text-cyan-300" />
                                                </div>
                                            )}
                                            
                                            <div className={`px-6 py-4 rounded-[1.5rem] shadow-xl ${
                                                msg.role === "user" 
                                                ? "bg-gradient-to-br from-zinc-200 to-white text-black rounded-br-sm" 
                                                : "ultra-glass text-white/90 rounded-bl-sm border border-white/10"
                                            }`}>
                                                <p className="whitespace-pre-wrap text-[15px] leading-[1.6]">{msg.content}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {chatting && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-end gap-3 max-w-[85%]"
                                    >
                                        <div className="w-8 h-8 rounded-xl ultra-glass flex items-center justify-center flex-shrink-0 mb-1 border-purple-500/30">
                                            <Sparkles size={14} className="text-purple-300" />
                                        </div>
                                        <div className="px-6 py-5 rounded-[1.5rem] rounded-bl-sm ultra-glass border border-white/10 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full typing-orb"></div>
                                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full typing-orb" style={{animationDelay: "0.2s"}}></div>
                                            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full typing-orb" style={{animationDelay: "0.4s"}}></div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>

                            {/* Floating Input Area */}
                            <div className="mt-auto pt-4 pb-2 relative z-20">
                                <div className="ultra-glass rounded-[2rem] p-2 pr-2.5 flex items-center gap-3 border border-white/10 glowing-border-focus transition-shadow duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                                    <input 
                                        type="text" 
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleSend()}
                                        placeholder="Ask the document anything..."
                                        className="flex-1 bg-transparent text-white py-3 pl-6 focus:outline-none placeholder:text-white/30 text-[15px]"
                                    />
                                    <button 
                                        onClick={handleSend}
                                        disabled={!input.trim() || chatting}
                                        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:shadow-none"
                                    >
                                        <Send size={18} className={`transform translate-x-[1px] translate-y-[1px] ${chatting ? 'opacity-0' : 'opacity-100'}`} />
                                        {chatting && <Activity size={18} className="absolute text-cyan-600 animate-spin" />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Global style for hiding inner scrollbar in chat for a cleaner look */}
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </main>
    );
}
