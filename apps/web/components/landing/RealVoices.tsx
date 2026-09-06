'use client';

interface RealVoicesProps {
  onOpenTrial: () => void;
}

export default function RealVoices({ onOpenTrial }: RealVoicesProps) {
  return (
    <section className="s_realvoices" id="testimonials">
      <div className="s_container">
        <div className="s_row s_align-center s_content-between mb-8">
          <div className="s_col-5">
            <div className="s_realvoices-lefttitle">
              <h2>
                Real Voices.
                <br /> Proven Results.
              </h2>
            </div>
          </div>
          <div className="s_col-5">
            <div className="s_realvoices-righttitle">
              <p>
                Hear from our family of 30,000+ CAs, tax, accounting and auditing professionals who trust us to power
                their practices so they can scale with confidence.
              </p>
              <button
                className="s_button s_button-trans"
                type="button"
                onClick={onOpenTrial}
              >
                Sign up now
              </button>
            </div>
          </div>
        </div>

        <div className="s_row">
          {/* 80% Time Saved */}
          <div className="s_col-3">
            <div className="s_realvoices-card s_realvoices-card-1">
              <h6>80%</h6>
              <p>Time Saved</p>
            </div>
          </div>

          {/* 100% Accuracy */}
          <div className="s_col-3">
            <div className="s_realvoices-card s_realvoices-card-2">
              <h6>100%</h6>
              <p>Accuracy</p>
            </div>
          </div>

          {/* Testimonial 1: Rahul Mehta */}
          <div className="s_col-6">
            <div className="s_realvoices-card s_realvoices-card-3">
              <div className="s_realvoices-card-3-img">
                <img
                  alt="Rahul Mehta"
                  loading="lazy"
                  width={163}
                  height={192}
                  className="rounded-xl object-cover"
                  src="https://static.taxone.vyapar.com/images/taxone/home/real-voices/s_real-voices-1.webp"
                />
              </div>
              <div className="s_realvoices-card-3-content s_flex-1">
                <p>
                  Vyapar TaxOne has completely transformed how we handle GST filings! Automating document collection from
                  WhatsApp and reconciling invoices has saved us countless hours of manual work. Now, we focus on scaling
                  our practice rather than chasing clients for data.
                </p>
                <h5>Rahul Mehta, Chartered Accountant</h5>
              </div>
            </div>
          </div>

          {/* Testimonial 2: Sneha Kulkarni */}
          <div className="s_col-6">
            <div className="s_realvoices-card s_realvoices-card-3">
              <div className="s_realvoices-card-3-img">
                <img
                  alt="Sneha Kulkarni"
                  loading="lazy"
                  width={163}
                  height={192}
                  className="rounded-xl object-cover"
                  src="https://static.taxone.vyapar.com/images/taxone/home/real-voices/s_real-voices-2.webp"
                />
              </div>
              <div className="s_realvoices-card-3-content s_flex-1">
                <p>
                  Manual data entry was our biggest headache until we switched to Vyapar TaxOne. Now, everything from
                  invoice reconciliation to GST filing happens seamlessly, cutting our workload by 80%. The integration
                  with Tally and Excel is a game-changer!
                </p>
                <h5>Sneha Kulkarni, Tax Consultant</h5>
              </div>
            </div>
          </div>

          {/* 5X Faster GST Filing */}
          <div className="s_col-3">
            <div className="s_realvoices-card s_realvoices-card-1">
              <h6>5X</h6>
              <p>Faster GST Filing</p>
            </div>
          </div>

          {/* Zero Duplicate Entries */}
          <div className="s_col-3">
            <div className="s_realvoices-card s_realvoices-card-2">
              <h6>Zero</h6>
              <p>Duplicate Entries</p>
            </div>
          </div>

          {/* 50% Fewer Follow-ups */}
          <div className="s_col-3">
            <div className="s_realvoices-card s_realvoices-card-1">
              <h6>50%</h6>
              <p>Fewer Follow-ups</p>
            </div>
          </div>

          {/* Seamless Integration */}
          <div className="s_col-3">
            <div className="s_realvoices-card s_realvoices-card-2">
              <h6>Seamless</h6>
              <p>Integration</p>
            </div>
          </div>

          {/* Testimonial 3: Vikas Sharma */}
          <div className="s_col-6">
            <div className="s_realvoices-card s_realvoices-card-3">
              <div className="s_realvoices-card-3-img">
                <img
                  alt="Vikas Sharma"
                  loading="lazy"
                  width={163}
                  height={192}
                  className="rounded-xl object-cover"
                  src="https://static.taxone.vyapar.com/images/taxone/home/real-voices/s_real-voices-3.webp"
                />
              </div>
              <div className="s_realvoices-card-3-content s_flex-1">
                <p>
                  Vyapar TaxOne’s automation has helped us eliminate errors and reduce compliance risks. The platform
                  ensures 100% accurate data structuring, making tax filing stress-free. Highly recommended for every CA
                  office!
                </p>
                <h5>Vikas Sharma, GST Practitioner</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

