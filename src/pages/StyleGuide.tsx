import { useTranslation } from 'react-i18next';

export default function StyleGuide() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background p-8 font-sans text-text-main">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold mb-2">Stitch Style Guide</h1>
                    <p className="text-text-muted text-lg">Local design system reference for Visit Manager.</p>
                </div>

                {/* Colors */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6">Colors</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ColorCard name="Primary" color="bg-primary" hex="#6C5DD3" text="text-white" />
                        <ColorCard name="Secondary" color="bg-secondary" hex="#C6F066" text="text-text-main" />
                        <ColorCard name="Tertiary" color="bg-tertiary" hex="#FFAB7B" text="text-text-main" />
                        <ColorCard name="Background" color="bg-background" hex="#F8F9FD" text="text-text-main" border />
                        <ColorCard name="Surface" color="bg-surface" hex="#FFFFFF" text="text-text-main" border />
                        <ColorCard name="Text Main" color="bg-text-main" hex="#1A1C1E" text="text-white" />
                        <ColorCard name="Text Muted" color="bg-text-muted" hex="#8E9298" text="text-white" />
                    </div>
                </section>

                {/* Typography */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6">Typography (Plus Jakarta Sans)</h2>
                    <div className="space-y-6 p-6 bg-surface rounded-3xl shadow-soft">
                        <div>
                            <h1 className="text-4xl font-bold">Heading 1 (4xl Bold)</h1>
                            <p className="text-sm text-text-muted">Used for main page titles</p>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">Heading 2 (3xl Bold)</h2>
                            <p className="text-sm text-text-muted">Used for section headers</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold">Heading 3 (2xl Semibold)</h3>
                            <p className="text-sm text-text-muted">Used for card titles</p>
                        </div>
                        <div>
                            <p className="text-base text-text-main">Body Text (Base). The quick brown fox jumps over the lazy dog. A comfortable reading size for mobile and desktop interfaces.</p>
                            <p className="text-sm text-text-muted">Used for standard content</p>
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Muted Text (Small). Used for secondary information, timestamps, and captions.</p>
                        </div>
                    </div>
                </section>

                {/* Components */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6">Components</h2>
                    <div className="space-y-8">

                        {/* Buttons */}
                        <div className="p-6 bg-surface rounded-3xl shadow-soft space-y-4">
                            <h3 className="text-lg font-medium text-text-muted uppercase tracking-wider">Buttons</h3>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-opacity">
                                    Primary Button
                                </button>
                                <button className="bg-secondary text-text-main px-6 py-3 rounded-xl font-semibold shadow-soft hover:opacity-90 transition-opacity">
                                    Secondary Button
                                </button>
                                <button className="bg-surface border border-gray-200 text-text-main px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                                    Outline / Ghost
                                </button>
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="p-6 bg-surface rounded-3xl shadow-soft space-y-4">
                            <h3 className="text-lg font-medium text-text-muted uppercase tracking-wider">Visit Card</h3>

                            {/* Actual Card implementation preview */}
                            <div className="bg-surface p-4 rounded-2xl shadow-soft border-l-4 border-primary flex justify-between items-center max-w-md">
                                <div>
                                    <div className="text-sm font-bold text-text-muted mb-1">10:00 - 11:00</div>
                                    <h4 className="text-lg font-bold text-text-main">Jan Kowalski</h4>
                                    <p className="text-text-muted">Strzyżenie męskie</p>
                                </div>
                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {t('confirmed')}
                                </div>
                            </div>
                        </div>

                        {/* Shapes */}
                        <div className="p-6 bg-surface rounded-3xl shadow-soft space-y-4">
                            <h3 className="text-lg font-medium text-text-muted uppercase tracking-wider">Border Radius</h3>
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-white text-xs">xl (20px)</div>
                                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-xs">2xl (24px)</div>
                                <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white text-xs">3xl (32px)</div>
                                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xs">Full</div>
                            </div>
                        </div>

                    </div>
                </section>

            </div>
        </div>
    );
}

function ColorCard({ name, color, hex, text, border = false }: { name: string, color: string, hex: string, text: string, border?: boolean }) {
    return (
        <div className={`p-4 rounded-2xl ${color} ${text} ${border ? 'border border-gray-200' : ''} flex flex-col justify-between h-32 shadow-sm`}>
            <span className="font-bold">{name}</span>
            <span className="font-mono text-sm opacity-80">{hex}</span>
        </div>
    );
}
