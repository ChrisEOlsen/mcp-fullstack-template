import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { SessionProvider, useSession, signOut } from "next-auth/react";
import {
    UsersIcon,
    CalendarIcon,
    EnvelopeIcon,
    PencilSquareIcon,
    ShoppingBagIcon,
    CameraIcon,
    DocumentDuplicateIcon,
    UserGroupIcon,
    ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { CloudArrowUpIcon, LockClosedIcon, ServerIcon, HeartIcon } from '@heroicons/react/20/solid';

const features = [
  {
    name: 'In-App Client Chat & Domain',
    description: 'Real-time messaging with your clients.',
    icon: UserGroupIcon,
  },
  {
    name: 'Cloud Media Hosting',
    description: 'Host and deliver photos, videos, and documents.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Payment Handling',
    description: 'Accept payments and subscriptions.',
    icon: LockClosedIcon,
  },
]

// --- REFINED SVG ICONS (with forwardRef) ---
const Icon = React.forwardRef(({ className, children, ...props }, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{children}</svg>
));
Icon.displayName = 'Icon';

const CheckCircleIcon = (props) => <Icon {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Icon>;
const SparklesIcon = (props) => <Icon {...props}><path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9z"/></Icon>;
const ChevronDownIcon = (props) => <Icon {...props}><path d="m6 9 6 6 6-6" /></Icon>;
const ArrowRightIcon = (props) => <Icon {...props}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></Icon>;
const SearchIcon = (props) => <Icon {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>;
const LoaderIcon = (props) => <Icon {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></Icon>;
const MenuIcon = (props) => <Icon {...props}><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></Icon>;
const XIcon = (props) => <Icon {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>;
const GlobeIcon = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></Icon>;
const AlertCircleIcon = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon>;
const ChatBubbleIcon = (props) => <Icon {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Icon>;

const featureIcons = {
    domain: ServerIcon,
    calendar: CalendarIcon,
    payments: LockClosedIcon,
    cloud: CloudArrowUpIcon,
    tools: PencilSquareIcon,
    users: UsersIcon,
    email: EnvelopeIcon,
    services: ShoppingBagIcon,
    media: CameraIcon,
    documents: DocumentDuplicateIcon,
    chat: ChatBubbleIcon,
};

// --- REUSABLE UI COMPONENTS ---

const SectionHeader = ({ title, subtitle }) => (
    <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-balance text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">{title}</h2>
        {subtitle && <p className="text-lg/8 text-zinc-300">{subtitle}</p>}
    </div>
);

const BlurEffect = () => (
    <>
        <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/4 -z-10 -translate-x-1/2 -translate-y-1/2 transform-gpu blur-3xl"
        >
            <div
                style={{
                    clipPath:
                        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#c084fc] to-[#9089fc] opacity-25"
            />
        </div>
        <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-2/4 -z-10 -translate-x-1/2 -translate-y-1/2 transform-gpu blur-3xl"
        >
            <div
                style={{
                    clipPath:
                        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#9089fc] to-[#c084fc] opacity-20"
            />
        </div>
        <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-3/4 -z-10 -translate-x-1/2 -translate-y-1/2 transform-gpu blur-3xl"
        >
            <div
                style={{
                    clipPath:
                        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#c084fc] to-[#9089fc] opacity-20"
            />
        </div>
    </>
);

const FeatureCarousel = ({ features }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animationClass, setAnimationClass] = useState('translate-y-0 opacity-100');
    const isTransitioningRef = useRef(false);
    const timeoutRef = useRef(null);
    const intervalRef = useRef(null);

    // This effect will run only on unmount to clear any pending timeouts.
    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    const transitionTo = useCallback((newIndex) => {
        if (isTransitioningRef.current || newIndex === activeIndex) return;
        isTransitioningRef.current = true;

        setAnimationClass('-translate-y-full opacity-0'); // Fly out

        timeoutRef.current = setTimeout(() => {
            setAnimationClass('translate-y-full opacity-0'); // Prepare for fly-in
            setActiveIndex(newIndex);

            timeoutRef.current = setTimeout(() => {
                setAnimationClass('translate-y-0 opacity-100'); // Fly in
                isTransitioningRef.current = false;
            }, 50);
        }, 500);
    }, [activeIndex]);

    const handleSelect = (index) => {
        clearInterval(intervalRef.current); // Stop auto-play
        transitionTo(index);
    };

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            transitionTo((activeIndex + 1) % features.length);
        }, 5000);

        return () => {
            clearInterval(intervalRef.current);
        };
    }, [activeIndex, features.length, transitionTo]);

    const activeFeature = features[activeIndex];
    const IconComponent = featureIcons[activeFeature.icon];

    return (
        <div className="relative w-full max-w-4xl mx-auto min-h-[380px] flex flex-col">
            <div className="relative flex-grow overflow-hidden">
                <div
                    key={activeIndex}
                    className={`absolute w-full transition-all duration-500 ease-in-out ${animationClass}`}
                >
                    <div className="bg-black/20 backdrop-blur-lg p-8 sm:p-12 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center">
                                <IconComponent className="w-8 h-8 md:w-10 md:h-10" />
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-zinc-100">{activeFeature.title}</h3>
                            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">{activeFeature.description}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center gap-3 mt-4">
                {features.map((feature, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelect(index)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeIndex === index ? 'bg-indigo-600' : 'bg-zinc-700/50 hover:bg-zinc-600/50'}`}
                        aria-label={`Go to feature: ${feature.title}`}
                    >
                        <div className={`w-8 h-8 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center`}>
                           {React.createElement(featureIcons[feature.icon], { className: "w-5 h-5" })}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const FeatureListItem = ({ icon, text }) => {
    const IconComponent = featureIcons[icon];
    return (
        <li className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-6 h-6" />
            </div>
            <span className="font-semibold text-zinc-200">{text}</span>
        </li>
    );
};

const PricingFeature = ({ children }) => (
    <li className="flex items-center gap-3">
        <CheckCircleIcon className="h-6 w-6 text-indigo-500 flex-shrink-0" />
        <span>{children}</span>
    </li>
);

const TextRotator = ({ items, interval = 3000, fontWeight = 'font-normal' }) => {
    const [index, setIndex] = useState(0);
    const [animationClass, setAnimationClass] = useState('translate-y-0 opacity-100');

    useEffect(() => {
        const timer = setInterval(() => {
            // Fly out
            setAnimationClass('-translate-y-full opacity-0');

            setTimeout(() => {
                // Prepare for fly-in from bottom
                setAnimationClass('translate-y-full opacity-0');

                // Change text
                setIndex((prevIndex) => (prevIndex + 1) % items.length);

                // Fly in
                setTimeout(() => {
                    setAnimationClass('translate-y-0 opacity-100');
                }, 50); // Short delay to ensure the class change is registered by the browser

            }, 500); // Duration of fly-out animation
        }, interval);

        return () => clearInterval(timer);
    }, [items.length, interval]);

    const IconComponent = items[index].icon ? featureIcons[items[index].icon] : null;

    return (
        <div className="h-20 sm:h-24 max-w-3xl mx-auto text-zinc-300 mb-10 relative overflow-hidden">
            <div
                className={`absolute w-full transition-all duration-500 ease-in-out flex items-center gap-3 ${animationClass}`}
            >
                {IconComponent && <IconComponent className="h-6 w-6 text-indigo-400 flex-shrink-0" />}
                <p className={`text-base sm:text-lg ${fontWeight}`}>
                    {items[index].text}
                </p>
            </div>
        </div>
    );
};

const FaqItem = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-zinc-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-6 text-left group"
            >
                <h3 className="text-lg font-medium text-zinc-200 group-hover:text-white transition-colors">{question}</h3>
                <ChevronDownIcon className={`h-6 w-6 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <div className="pb-6 pr-10 text-zinc-300/90 leading-relaxed space-y-4">{children}</div>
                </div>
            </div>
        </div>
    );
};


// --- LOGIC-HEAVY COMPONENTS ---

const Header = () => {
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => { document.documentElement.style.scrollBehavior = 'auto'; };
    }, []);

    const navLinks = [
        { href: "#features", label: "Features" },
        { href: "#pricing", label: "Pricing" },
        { href: "#faq", label: "FAQ" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <a href="#" className="text-2xl font-semibold tracking-tight">Exersites</a>
                <nav className="hidden md:flex items-center space-x-8">
                    {navLinks.map(link => <a key={link.href} href={link.href} className="text-zinc-300 hover:text-white transition">{link.label}</a>)}
                </nav>
                <div className="hidden md:flex items-center gap-4">
                    {session?.user ? (
                        <>
                            <div className="relative" ref={userMenuRef}>
                                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-zinc-800 transition">
                                    <img src={session.user.image || `https://avatar.vercel.sh/${session.user.email}`} alt={session.user.name || 'User'} className="w-8 h-8 rounded-full bg-zinc-700" />
                                    <span className="text-zinc-200 hidden sm:block font-medium">{session.user.name}</span>
                                </button>
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-zinc-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                        <button onClick={() => signOut()} className="block w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700">Sign Out</button>
                                    </div>
                                )}
                            </div>
                            <a href="/onboarding/start" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg transition flex items-center gap-2 text-sm">Continue Onboarding <ArrowRightIcon className="h-4 w-4" /></a>
                        </>
                    ) : (
                        <a href="/onboarding/start" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg transition">Login / Register</a>
                    )}
                </div>
                <div className="md:hidden">
                    <button onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}</button>
                </div>
            </div>
            {menuOpen && (
                <div className="md:hidden bg-zinc-900 border-t border-zinc-800">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-4 flex flex-col items-center gap-4 pt-4">
                        {navLinks.map(link => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-zinc-300 hover:text-white transition py-2">{link.label}</a>)}
                        
                        {/* --- MODIFIED SECTION START --- */}
                        {session?.user ? (
                            <div className="w-full pt-5 mt-5 border-t border-zinc-700/50 flex flex-col items-center gap-4">
                                <div className="flex flex-col items-center gap-2">
                                    <img src={session.user.image || `https://avatar.vercel.sh/${session.user.email}`} alt={session.user.name || 'User'} className="w-12 h-12 rounded-full bg-zinc-700" />
                                    <span className="font-semibold text-zinc-100 text-lg">{session.user.name}</span>
                                </div>
                                <a href="/onboarding/start" className="w-full text-center block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-3 rounded-lg transition">Continue Onboarding</a>
                                <button onClick={() => signOut()} className="text-zinc-400 hover:text-white transition font-medium">Sign Out</button>
                            </div>
                        ) : (
                            <div className="mt-4 w-full">
                                <a href="/onboarding/start" className="w-full text-center block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg transition">Sign Up</a>
                            </div>
                        )}
                        {/* --- MODIFIED SECTION END --- */}

                    </div>
                </div>
            )}
        </header>
    );
};

const DomainSearch = () => {
    const [domain, setDomain] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        const cleanedDomain = domain.replace(/\s+/g, '').toLowerCase();
        
        // Validation logic
        const domainRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z]{2,}$/i;
        if (!cleanedDomain) {
            setError('Please enter a domain name to search.');
            return;
        }
        if (!domainRegex.test(cleanedDomain)) {
            setError("Invalid format. Please use 'yourwebsite.com' or 'yourwebsite.fit'.");
            return;
        }

        setIsLoading(true);
        setSearchResult(null);
        setError('');
        
        await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay

        try {
            const res = await fetch("/api/domain/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain_name: cleanedDomain }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'An unexpected error occurred.' }));
                throw new Error(errorData.message);
            }

            const result = await res.json();
            setSearchResult(result);

        } catch (err) {
            setError(err.message);
            setSearchResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setDomain(e.target.value);
        if (searchResult) setSearchResult(null);
        if (error) setError('');
    };

    const handleClaimDomain = () => {
        if (searchResult && searchResult.domain) {
            localStorage.setItem('domainForOnboarding', searchResult.domain);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-zinc-900/50 border border-zinc-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-900/20 backdrop-blur-sm">
            <p className="text-lg text-center text-zinc-200 mb-6">
                What would you like to name your website?
            </p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                        <GlobeIcon className="h-5 w-5 text-zinc-400" />
                    </div>
                    <input
                        type="text"
                        value={domain}
                        onChange={handleInputChange}
                        placeholder="yourbusiness.com"
                        className="w-full text-lg pl-14 pr-5 py-4 bg-zinc-800/60 border-2 border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition duration-200"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg transition text-lg flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <LoaderIcon className="h-6 w-6 animate-spin" />
                    ) : (
                        <><SearchIcon className="h-5 w-5 mr-2.5 hidden sm:inline" /><span>Search</span></>
                    )}
                </button>
            </form>
            
            <div className="mt-6 text-center flex items-center justify-center">
                {searchResult && (
                    <div className="w-full animate-fade-in">
                        {searchResult.available ? (
                            <div className="bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircleIcon className="h-6 w-6 text-green-400 flex-shrink-0" />
                                    <p className="font-medium text-left">
                                        Congratulations! <span className="font-bold text-white">{searchResult.domain}</span> is available.
                                    </p>
                                </div>
                                <a
                                    href={`/onboarding/start?domain=${searchResult.domain}`}
                                    onClick={handleClaimDomain}
                                    className="flex-shrink-0 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm flex items-center gap-2"
                                >
                                    Claim Domain <ArrowRightIcon className="h-4 w-4" />
                                </a>
                            </div>
                        ) : (
                            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg p-4 flex items-center justify-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-amber-400 flex-shrink-0"/>
                                <p className="font-medium">
                                    Sorry, <span className="font-bold text-white">{searchResult.domain}</span> is already taken.
                                </p>
                            </div>
                        )}
                    </div>
                )}
                {error && (
                    <div className="animate-fade-in bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-4 flex items-center justify-center gap-3">
                        <AlertCircleIcon className="h-6 w-6 text-red-400 flex-shrink-0"/>
                        <p className="font-medium">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
function App() {
    const { data: session } = useSession();
    
    const features = [
        { icon: 'chat', title: 'In-App Client Chat & Domain', description: 'Engage clients directly with a powerful in-app chat feature, all within your custom domain.' },
        { icon: 'users', title: 'Client Administration', description: 'Manage all your clients from a single dashboard. Track progress, communicate, and deliver personalized content with ease.' },
        { icon: 'cloud', title: 'Cloud Media Hosting', description: 'Upload and host photos or videos. Share them publicly on your site or assign them privately to individual clients.' },
        { icon: 'services', title: 'Custom Services', description: 'Define your own services and products. Clients can purchase and get instant access to content directly through your web app.' },
        { icon: 'payments', title: 'Payment Handling', description: 'Manage one-time payments and recurring subscriptions. Securely integrated into your dashboard.' },
        { icon: 'calendar', title: 'Google Suite Integration', description: 'Connect your Google account to integrate with services like Calendar, Drive, and more for a seamless workflow.' },
    ];

    const faqs = [
        { question: "What is included in my subscription?", answer: <p>Your Exersites subscription includes all core features: website hosting, in-app client chat, client management, content delivery, and payment processing. All future updates and new features are also included.</p> },
        { question: "What is the in-app chat feature like?", answer: <p>The in-app chat provides real-time messaging, allowing you to communicate directly with your clients within your branded web app. It's designed for seamless, instant support and engagement.</p> },
        { question: "What is the experience like for my clients?", answer: <p>Your clients get a seamless, professional experience. They can log into your branded web app on your own domain to access a dedicated 'My Content' page with any documents, videos, or programs you've assigned to them. They can also purchase services and manage their account directly.</p> },
        { question: "How customizable is my website, and is it hard to set up?", answer: <p>The platform is designed to be user-friendly, with no coding required. You can customize the look and feel of your website, define your own services, and upload your own content. The onboarding process guides you through connecting your domain and setting up your business essentials step-by-step.</p> },
        { question: "Are there any hidden fees or transaction costs?", answer: <p>We believe in transparent pricing. The only extra cost is for your custom domain, which you purchase and own. The monthly subscription fee covers all platform features. Standard payment processor fees (e.g., from Stripe) are generally small and will apply to transactions, but Exersites does not charge any additional fees.</p> },
        { question: "Is the dashboard mobile friendly?", answer: <p>Yes, the client dashboard and most administrative features are fully responsive and mobile-friendly. The only exception is the website editor, which is designed for an optimal experience on desktop devices.</p> },
    ];

    return (
        <div className="bg-zinc-900 text-white font-sans antialiased">
            <Head>
                <title>Exersites | All-in-One Platform for Fitness Professionals</title>
                <meta name="description" content="Launch your fitness business online with a custom domain, client chat, payment handling, and media hosting. Exersites is the all-in-one solution for personal trainers and wellness coaches." />
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://exersites.fit/" />
                <meta property="og:title" content="Exersites | All-in-One Platform for Fitness Professionals" />
                <meta property="og:description" content="The ultimate business-in-a-box for fitness coaches. Get your own website, client management tools, and payment processing." />
                <meta property="og:image" content="https://exersites.fit/og-image-waves.png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://exersites.fit/" />
                <meta property="twitter:title" content="Exersites | All-in-One Platform for Fitness Professionals" />
                <meta property="twitter:description" content="The ultimate business-in-a-box for fitness coaches. Get your own website, client management tools, and payment processing." />
                <meta property="twitter:image" content="https://exersites.fit/og-image-waves.png" />

                <link rel="canonical" href="https://exersites.fit/" />
            </Head>
            <Header />
            <div className="relative isolate overflow-x-hidden">
                <BlurEffect />
                <main>
                    <section className="relative pt-32 pb-16 md:pt-40 md:pb-16 text-center overflow-hidden">
                        <div className="absolute inset-0 -z-10">
                            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-zinc-900"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-20%,rgba(144,137,252,0.3),rgba(255,255,255,0))]"></div>
                        </div>
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                            <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter leading-tight mb-6 animate-fade-in-down">Your All-in-One <br className="hidden md:block" /> Platform for Client Success</h1>
                            <div className="max-w-3xl mx-auto text-center space-y-2 mb-10">
                                <p className="text-lg font-medium leading-relaxed text-zinc-300">Simply input the name of your website and complete the onboarding process. Your site will be live and ready for editing in <span className="text-indigo-400 font-semibold">10 minutes!</span></p>
                                <p className="text-base text-zinc-400 leading-relaxed">Your site can handle payments, scheduling, deliver content through client portals, chat and much more!</p>
                            </div>

                            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                {session?.user ? (
                                    <div className="max-w-3xl mx-auto bg-zinc-900/50 border border-zinc-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-900/20 backdrop-blur-sm text-center">
                                        <h2 className="text-3xl font-bold text-zinc-100 mb-4">
                                            Hi {session.user.name?.split(' ')[0]}!
                                        </h2>
                                        <p className="text-lg text-zinc-300 mb-8">
                                            You're just a few steps away from launching your business.
                                        </p>
                                        <a
                                            href="/onboarding/start"
                                            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg transition text-lg gap-2"
                                        >
                                            Continue Onboarding
                                            <ArrowRightIcon className="h-5 w-5" />
                                        </a>
                                    </div>
                                ) : (
                                    <DomainSearch />
                                )}
                            </div>

                        </div>
                    </section>

                    <section className="pt-12 pb-24 text-center">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                                🚀 Your Business, <span className="text-indigo-400">Supercharged</span> 🚀
                            </h2>
                            <p className="mt-6 text-lg/8 text-zinc-300 max-w-3xl mx-auto">
                                Exersites is the ultimate "business in a box" 📦 solution to launch your health and wellness empire online, hassle-free.
                            </p>
                            <p className="mt-4 text-lg/8 text-zinc-300 max-w-3xl mx-auto">
                                Go live on your own domain with a professional web app that handles 💳 payments, 🗓️ scheduling, content delivery, and 💬 built-in chat.
                            </p>
                        </div>
                    </section>

                    <section id="target-audience" className="relative py-24 sm:py-32 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-indigo-900"
                            style={{
                                clipPath: 'polygon(10rem 0, 100% 0, 100% calc(100% - 10rem), calc(100% - 10rem) 100%, 0 100%, 0 10rem)',
                            }}
                        ></div>
                        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                            <SectionHeader
                                title="It's Your Web-App. We Just Wrote the Software."
                                subtitle="Exersites is the #1 solution for establishing an online business presence without all the aches and pains. And the best part is - its your '.com' - not ours!"
                            />
                        </div>
                    </section>

                    <section id="features" className="overflow-hidden">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            {/* Part 1: Product Screenshot */}
                            <div className="py-24 md:py-32">
                                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center lg:gap-y-0">
                                    <div className="lg:row-start-2 lg:max-w-md">
                                        <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                            Your entire business, in one place.
                                        </h2>
                                        <p className="mt-6 mb-6 text-lg/8 text-gray-300">
                                            From client administration and communication to building your brand's website, Exersites provides a beautiful and intuitive interface for every task.
                                        </p>
                                        <ul className="space-y-5 mt-8">
                                            <FeatureListItem icon="users" text="Communicate instantly with clients using the in-app chat." />
                                            <FeatureListItem icon="users" text="Manage client schedules, sessions, and progress." />
                                            <FeatureListItem icon="services" text="Market and sell your services with integrated payment processing." />
                                            <FeatureListItem icon="media" text="Deliver personalized videos, documents, and media to your clients." />
                                        </ul>
                                    </div>
                                    <div className="relative lg:row-span-4">
                                        <div className="absolute -inset-12 -z-20 rounded-full bg-indigo-500/20 blur-3xl"></div>
                                        <img
                                            alt="Product screenshot"
                                            src="/assets/new-dashboard-screenshot-minimal.png"
                                            width={2432}
                                            height={1442}
                                            className="relative min-w-full max-w-xl rounded-xl shadow-xl ring-1 ring-white/10 lg:w-[64rem] lg:max-w-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Part 2: Unified Platform */}
                            <div className="py-16 md:py-16">
                                <h2 className="max-w-2xl mx-auto text-center text-3xl sm:text-4xl font-semibold tracking-tight mb-6">Let Your Site do the <span className="italic">Heavy Lifting</span></h2>
                                <p className="max-w-2xl mx-auto text-center text-lg/8 text-zinc-300 mb-10">Stop juggling multiple apps. We give you a professional, client-facing system that's fully integrated and ready to scale with your business.</p>
                                <FeatureCarousel features={features} />
                            </div>
                        </div>
                    </section>

                    <section id="pricing" className="py-24 md:py-32">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="mb-12 md:mb-16">
                                <SectionHeader title="Simple, Transparent Pricing" subtitle="One plan. All features. No hidden fees. Get everything you need to run and grow your business online." />
                            </div>
                            <div className="max-w-md mx-auto bg-black/20 backdrop-blur-lg rounded-2xl border border-zinc-800 p-8 md:p-10">
                                <h3 className="text-xl font-semibold text-zinc-100 mb-2">Standard Plan</h3>
                                <p className="text-zinc-400 mb-6">All features included. For professionals ready to grow.</p>
                                <div className="my-8"><span className="text-4xl font-semibold">$20</span><span className="text-xl text-zinc-400">/month</span></div>
                                <a href="/onboarding/start" className="w-full text-center block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-lg transition text-lg">Get Started Now</a>
                                <ul className="mt-8 space-y-4 text-zinc-300">
                                    <PricingFeature>Custom Domain & Website</PricingFeature>
                                    <PricingFeature>In-App Client Chat</PricingFeature>
                                    <PricingFeature>Cloud Media Hosting</PricingFeature>
                                    <PricingFeature>Unlimited Clients & Services</PricingFeature>
                                    <PricingFeature>Payment Integration</PricingFeature>
                                    <PricingFeature>Google Suite Integration</PricingFeature>
                                </ul>
                                <div className="mt-8 pt-6 border-t border-zinc-700/50 flex items-center gap-4 text-indigo-300">
                                    <SparklesIcon className="h-7 w-7 flex-shrink-0" />
                                    <p className="text-sm font-medium">
                                        Includes all future updates and platform improvements. Your plan only gets better over time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="faq" className="py-24 md:py-32">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="mb-12 md:mb-16">
                                <SectionHeader title="Frequently Asked Questions" />
                            </div>
                            <div className="max-w-3xl mx-auto">
                                {faqs.map((faq, index) => <FaqItem key={index} question={faq.question}>{faq.answer}</FaqItem>)}
                            </div>
                        </div>
                    </section>

                    <section className="py-24 md:py-32">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">Legitimize Your Business <span className="italic">Today</span></h2>
                            <p className="max-w-2xl mx-auto text-lg/8 text-zinc-300 mb-10">Focus on what you do best—training and empowering your clients—while we handle the complexities of your online business.</p>
                            <a href="/onboarding/start" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg transition text-lg">Sign Up Now</a>
                        </div>
                    </section>
                </main>
            </div>

            <footer className="border-t border-zinc-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-zinc-400">
                    <p>&copy; {new Date().getFullYear()} Exersites. All rights reserved. <a href="/privacy-policy" className="text-zinc-400 hover:text-white transition">Privacy Policy</a></p>
                </div>
            </footer>
        </div>
    );
}

export default function ExersitesPage() {
    return (<SessionProvider><App /></SessionProvider>);
}