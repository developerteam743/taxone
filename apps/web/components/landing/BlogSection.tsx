'use client';

interface BlogSectionProps {
  onOpenTrial: () => void;
}

export default function BlogSection({ onOpenTrial }: BlogSectionProps) {
  const blogs = [
    {
      id: 1,
      tag: 'Indian Taxation',
      date: 'Sep 4, 2026',
      title: 'PTEC vs PTRC in Maharashtra: Difference, Full Form & Registration Guide',
      image: 'https://strapi.taxone.vyapar.com/uploads/PTEC_vs_PTRC_57f9f4524a.webp',
      author: 'Sai Mohan',
      role: 'Tax Professional & Business Finance Expert',
      authorImg: 'https://strapi.taxone.vyapar.com/uploads/sai_mohan_76421f673a.png',
    },
    {
      id: 2,
      tag: 'GST',
      date: 'Sep 3, 2026',
      title: 'HSN Code List with GST Rates 2026: Quick Guide',
      image: 'https://strapi.taxone.vyapar.com/uploads/HSN_Code_List_5a110a9f27.webp',
      author: 'Sai Mohan',
      role: 'Tax Professional & Business Finance Expert',
      authorImg: 'https://strapi.taxone.vyapar.com/uploads/sai_mohan_76421f673a.png',
    },
    {
      id: 3,
      tag: 'Indian Taxation',
      date: 'Aug 11, 2026',
      title: 'TDS Under the New Income-tax Act, 2025: What Form 131 and Form 141 Change for CA Firms',
      image: 'https://strapi.taxone.vyapar.com/uploads/form_131_form_141_tds_changes_1200_X600_205619f1e8.webp',
      author: 'CA Samkit Sheth',
      role: 'Chartered Accountant',
      authorImg: 'https://strapi.taxone.vyapar.com/uploads/Samkit_Sheth_65a1f4ac01.jpeg',
    },
  ];

  return (
    <section className="s_blog-bottom s_homepage-blog" id="blog">
      <div className="s_container">
        <div className="s_section-title text-center">
          <h2>Stay Ahead with the Latest Trends and Tips from Industry Experts</h2>
          <p></p>
        </div>

        <div className="s_blog-bottom-inner">
          {blogs.map((b) => (
            <div className="s_blog-bottom-inner-list group hover:shadow-xl transition-shadow" key={b.id}>
              <div className="s_blog-bottom-inner-list-img overflow-hidden">
                <img
                  alt={b.title}
                  loading="lazy"
                  width={500}
                  height={300}
                  className="s_w-full s_h-full object-cover transform transition duration-500 group-hover:scale-105"
                  src={b.image}
                />
              </div>
              <div className="s_blog-bottom-inner-list-content">
                <div className="s_flex s_flex-wrap s_align-center mb-2">
                  <div className="s_blog-bottom-inner-list-content-tag font-semibold text-xs text-[#ED1A3B] bg-red-50 px-2.5 py-1 rounded">
                    {b.tag}
                  </div>
                  <div className="s_blog-bottom-inner-list-content-date text-xs text-gray-400 ml-3">
                    {b.date}
                  </div>
                </div>
                <div className="s_two-line font-bold text-gray-900 group-hover:text-[#ED1A3B] transition-colors cursor-pointer mb-4">
                  {b.title}
                </div>
                <div className="s_blog-bottom-inner-list-content-profile flex items-center">
                  <img
                    alt={b.author}
                    loading="lazy"
                    width={42}
                    height={42}
                    className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-100"
                    src={b.authorImg}
                  />
                  <div className="s_flex s_flex-col s_blog-bottom-inner-list-content-profile-content">
                    <h6 className="font-bold text-sm text-gray-900 leading-snug">{b.author}</h6>
                    <p className="text-xs text-gray-500">{b.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="s_row">
          <div className="s_col-12 s_text-center text-center mt-8">
            <button
              className="s_button s_ml-auto s_mr-auto"
              type="button"
              onClick={onOpenTrial}
            >
              Explore Insight
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

