/**
 * Dynamic Hub UI Template Processor
 * Builds and injects workspace utility modules seamlessly based on active configurations
 */
function renderHubModules() {
    const gridContainer = document.getElementById('modules-grid');
    if (!gridContainer) return;

    let gridHtml = '';

    hubModulesConfiguration.forEach(module => {
        const isOnline = module.status === 'online' || module.status === 'beta';
        
        // Dynamic styling adjustments based on module state
        const cardClass = isOnline 
            ? "group bg-[#0f111a] border border-slate-900 hover:border-rose-900/50 rounded-xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 hover:-translate-y-1"
            : "bg-[#0f111a]/40 border border-slate-900/50 rounded-xl overflow-hidden shadow-xl flex flex-col opacity-60";

        const badgeClass = module.status === 'online'
            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            : module.status === 'beta' 
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-slate-800 text-slate-500 border border-slate-700/30";

        const titleClass = isOnline
            ? "text-base font-bold text-slate-200 group-hover:text-rose-400 transition-colors"
            : "text-base font-bold text-slate-500";

        const descClass = isOnline ? "text-xs text-slate-400 leading-relaxed" : "text-xs text-slate-600 leading-relaxed";

        // Navigation element generation
        const actionButton = isOnline
            ? `<a href="${module.url}" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#141622] hover:bg-rose-600 border border-slate-800 hover:border-rose-500 text-xs font-medium rounded-lg text-slate-200 hover:text-white transition-all duration-200 group/btn shadow-md">
                Launch Workspace <i class="fa-solid fa-arrow-right text-[10px] group-hover/btn:translate-x-1 transition-transform"></i>
               </a>`
            : `<button disabled class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-transparent border border-slate-900 text-xs font-medium rounded-lg text-slate-600 cursor-not-allowed">
                Module Locked
               </button>`;

        // Separate image layout configuration logic to prevent tooltip overlay on hover actions
        let imageSectionHtml = '';
        if (module.image && module.image.trim() !== '') {
            imageSectionHtml = `
                <img src="${module.image}" alt="${module.title} Preview" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" class="preview-scroll-image w-full h-full">
                <div class="hidden absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#11131e] to-[#07080d] p-4 text-center">
                    <i class="${module.iconClass} text-slate-700 text-3xl mb-2"></i>
                    <span class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Preview Image Pending</span>
                </div>
            `;
        } else {
            imageSectionHtml = `
                <div class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#11131e] to-[#07080d] p-4 text-center">
                    <i class="${module.iconClass} ${isOnline ? 'text-rose-500/40 animate-pulse' : 'text-slate-700'} text-3xl mb-2"></i>
                    <span class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Preview Image Pending</span>
                </div>
            `;
        }

        gridHtml += `
            <div class="${cardClass}">
                <div class="relative aspect-video bg-[#05060a] overflow-hidden border-b border-slate-900/60 flex flex-col items-center justify-center">
                    ${imageSectionHtml}
                    <span class="absolute top-3 right-3 text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md ${badgeClass}">
                        ${module.statusText}
                    </span>
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div class="space-y-2">
                        <h3 class="${titleClass}">${module.title}</h3>
                        <p class="${descClass}">${module.description}</p>
                    </div>
                    ${actionButton}
                </div>
            </div>
        `;
    });

    gridContainer.innerHTML = gridHtml;
}

// Bind initialization phase
window.addEventListener('DOMContentLoaded', renderHubModules);