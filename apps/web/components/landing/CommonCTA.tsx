'use client';

interface CommonCTAProps {
  onOpenTrial: () => void;
}

export default function CommonCTA({ onOpenTrial }: CommonCTAProps) {
  return (
    <section className="s_commoncta">
      <div className="s_container">
        <div className="s_commoncta-bg">
          <div className="s_row s_align-center s_content-between">
            <div className="s_col-6">
              <div className="s_commoncta-content">
                <h4>Streamline Your Workflow with Vyapar TaxOne</h4>
                <p>Get started today and simplify your accounting process!</p>
                <button
                  className="s_button"
                  type="button"
                  onClick={onOpenTrial}
                >
                  Explore Vyapar TaxOne
                </button>
              </div>
            </div>
            <div className="s_col-5">
              <div className="s_commoncta-img">
                <img
                  alt="Streamline Workflow with Vyapar TaxOne"
                  loading="lazy"
                  width={445}
                  height={364}
                  className="s_w-full s_h-full object-contain"
                  src="https://static.taxone.vyapar.com/images/taxone/common/cta/s_common-cta.webp"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

