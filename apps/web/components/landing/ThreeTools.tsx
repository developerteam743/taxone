'use client';

interface ThreeToolsProps {
  onOpenTrial: () => void;
}

export default function ThreeTools({ onOpenTrial }: ThreeToolsProps) {
  const tools = [
    {
      id: 1,
      title: 'Client Communication(PMS)',
      badge: 'Coming Soon',
      image: 'https://static.taxone.vyapar.com/images/taxone/home/platform/s_one-platform-1.webp',
      alt: 'Client Communication PMS',
    },
    {
      id: 2,
      title: 'Data Entry Automation',
      badge: null,
      image: 'https://static.taxone.vyapar.com/images/taxone/home/platform/s_one-platform-2.webp',
      alt: 'Data Entry Automation',
    },
    {
      id: 3,
      title: 'GST Automation/Filing',
      badge: null,
      image: 'https://static.taxone.vyapar.com/images/taxone/home/platform/s_one-platform-3.webp',
      alt: 'GST Automation and Filing',
    },
  ];

  return (
    <section className="s_oneplatform" id="oneplatform">
      <div className="s_oneplatform-bg">
        <div className="s_container">
          <div className="s_section-title text-center">
            <h2>One Platform. Three Interconnected Power Tools.</h2>
            <p>
              Grow faster and onboard more clients—Vyapar TaxOne automates your workflow without increasing team
              size.
            </p>
          </div>

          <div className="s_row s_content-center">
            {tools.map((tool) => (
              <div className="s_col-4" key={tool.id}>
                <div className="s_oneplatform-features group hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h5>{tool.title}</h5>
                    {tool.badge && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-[#ED1A3B] border border-red-100">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <button
                    className="s_button s_button-primarytext"
                    type="button"
                    onClick={onOpenTrial}
                  >
                    Learn more
                    <svg
                      width="22px"
                      height="18px"
                      viewBox="0 0 38 18"
                      fill="#5E6782"
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-block ml-1 transition-transform group-hover:translate-x-1"
                    >
                      <path
                        fill="#5E6782"
                        className="s_fill"
                        d="M36.736 7.972h-.002L29.15.421a1.452 1.452 0 0 0-2.048 2.059l5.093 5.067H1.452a1.452 1.452 0 1 0 0 2.904h30.742L27.1 15.52a1.452 1.452 0 0 0 2.048 2.057l7.585-7.548.002-.002a1.453 1.453 0 0 0 0-2.055Z"
                      />
                    </svg>
                  </button>
                  <div className="mt-4 overflow-hidden rounded-xl">
                    <img
                      alt={tool.alt}
                      loading="lazy"
                      width={490}
                      height={358}
                      className="s_w-full s_h-full object-contain transform transition duration-500 group-hover:scale-105"
                      src={tool.image}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="s_row s_content-center mt-12">
            <div className="s_col-12">
              <div className="s_oneplatform-second">
                <div className="s_oneplatform-second-inner flex flex-col md:flex-row items-center justify-between p-8 rounded-2xl bg-white shadow-sm border border-slate-100">
                  <div className="mb-4 md:mb-0">
                    <h6 className="text-xl font-bold text-gray-900 mb-1">
                      Not sure how Vyapar TaxOne fits your workflow? Let’s walk you through it.
                    </h6>
                    <p className="text-gray-500 text-sm">Our product experts are just a conversation away.</p>
                  </div>
                  <button
                    className="s_button shrink-0"
                    type="button"
                    onClick={onOpenTrial}
                  >
                    Start Free Trial
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

