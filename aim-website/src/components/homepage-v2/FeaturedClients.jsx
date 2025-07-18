import './clients.css';

// Logos como componentes SVG inline para garantizar que se muestren
const CompanyLogos = {
    Microsoft: () => (
        <svg viewBox="0 0 23 23" className="h-8 w-auto">
            <path fill="#f25022" d="M1 1h10v10H1z"/>
            <path fill="#00a4ef" d="M12 1h10v10H12z"/>
            <path fill="#7fba00" d="M1 12h10v10H1z"/>
            <path fill="#ffb900" d="M12 12h10v10H12z"/>
        </svg>
    ),
    Intel: () => (
        <svg viewBox="0 0 71 24" className="h-6 w-auto">
            <path fill="#0071C5" d="M0 0h8v24H0zM12 7h8v17h-8zM24 0h8v17h8V0h8v24H24zM52 7h8v10h8V7h3v17h-19z"/>
        </svg>
    ),
    Siemens: () => (
        <div className="text-xl font-bold text-gray-600 tracking-wider">SIEMENS</div>
    ),
    ABB: () => (
        <div className="text-xl font-bold text-red-600 tracking-wider">ABB</div>
    ),
    Schneider: () => (
        <div className="text-lg font-bold text-green-600 tracking-wider">Schneider Electric</div>
    ),
    Rockwell: () => (
        <div className="text-lg font-bold text-blue-600 tracking-wider">Rockwell Automation</div>
    ),
    Honeywell: () => (
        <div className="text-lg font-bold text-orange-600 tracking-wider">Honeywell</div>
    ),
    Bosch: () => (
        <div className="text-lg font-bold text-gray-700 tracking-wider">BOSCH</div>
    )
};

const clients = [
    { name: 'Microsoft', component: CompanyLogos.Microsoft },
    { name: 'Intel', component: CompanyLogos.Intel },
    { name: 'Siemens', component: CompanyLogos.Siemens },
    { name: 'ABB', component: CompanyLogos.ABB },
    { name: 'Schneider Electric', component: CompanyLogos.Schneider },
    { name: 'Rockwell Automation', component: CompanyLogos.Rockwell },
    { name: 'Honeywell', component: CompanyLogos.Honeywell },
    { name: 'Bosch', component: CompanyLogos.Bosch },
];

// Duplicamos para el efecto infinito
const allClients = [...clients, ...clients]; 

export default function FeaturedClients() {
    return (
        <div className="bg-white py-12">
            <div className="container mx-auto px-4 text-center">
                 <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest">Con la Confianza de Líderes de la Industria</h3>
            </div>
            <div className="mt-8 w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
                <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
                    {allClients.map((client, index) => {
                        const LogoComponent = client.component;
                        return (
                            <li key={index} className="flex items-center justify-center min-w-[120px]">
                                <LogoComponent />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
} 