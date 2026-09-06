'use client';

interface FourStageWorkflowProps {
  onOpenTrial: () => void;
}

export default function FourStageWorkflow({ onOpenTrial }: FourStageWorkflowProps) {
  const stages = [
    {
      id: 1,
      title: 'Auto-Collect Documents',
      description: (
        <>
          Gather all the documents straight from your clients through automated WhatsApp reminders and{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://vyaparapp.in/free/small-business-accounting-software"
            className="text-[#ED1A3B] underline font-medium"
          >
            Vyapar Accounting Software
          </a>{' '}
          integration without any human intervention!
        </>
      ),
      image: 'https://static.taxone.vyapar.com/images/taxone/home/features/s_features-1.webp',
      alt: 'Auto-Collect Documents',
    },
    {
      id: 2,
      title: 'Auto-Sort & Organise',
      description:
        'Sort and segregate sale/purchase invoices Excel, bank statements and ledgers from your clients automatically through WhatsApp. In case of missing documents, Vyapar TaxOne sends timely reminders to ensure you stay on track.',
      image: 'https://static.taxone.vyapar.com/images/taxone/home/features/s_features-2.webp',
      alt: 'Auto-Sort and Organise',
    },
    {
      id: 3,
      title: 'Data Entry Automation',
      description:
        'We map your client’s data, smart-tag it and convert banking, sales and purchase data into accurate ledgers with Tally integration. All you have to do is cross-check and verify it in a single click.',
      image: 'https://static.taxone.vyapar.com/images/taxone/home/features/s_features-3.webp',
      alt: 'Data Entry Automation',
    },
    {
      id: 4,
      title: 'GST Automation',
      description:
        'Embrace one ecosystem for all your document needs that not only collects all your Vouchers from Vyapar, Tally and Vyapar TaxOne Chat but also runs 30+ validations to help you file and reconcile GST effortlessly!',
      image: 'https://static.taxone.vyapar.com/images/taxone/home/features/s_features-4.webp',
      alt: 'GST Automation and Reconciliation',
    },
  ];

  return (
    <section className="s_features" id="features">
      <div className="s_container">
        <div className="s_section-title text-center">
          <h2>One AI Accounting Platform, Complete Control on Filing and Compliance</h2>
          <p>
            Streamline your workflows with a 4-stage process that automates the complete bookkeeping process,
            including document collection, conciliation, data entry, and GST filing.
          </p>
        </div>

        <div className="s_row">
          <div className="s_col-12">
            {stages.map((stage) => (
              <div className="s_features-bg" key={stage.id}>
                <div className="s_row s_align-center s_content-center">
                  <div className="s_col-5">
                    <div className="s_features-content">
                      <h6>{stage.title}</h6>
                      <p>{stage.description}</p>
                      <button
                        className="s_button s_button-trans"
                        type="button"
                        onClick={onOpenTrial}
                      >
                        Know more details
                      </button>
                    </div>
                  </div>
                  <div className="s_col-5">
                    <div className="s_features-img">
                      <img
                        alt={stage.alt}
                        loading="lazy"
                        width={460}
                        height={340}
                        className="s_w-full s_h-full object-contain"
                        src={stage.image}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

