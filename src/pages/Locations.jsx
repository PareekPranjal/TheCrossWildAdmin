import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, MapPin, X, Loader2, Save,
  Eye, EyeOff, ExternalLink, Image as ImageIcon, RefreshCw,
} from 'lucide-react';
import { locationsAPI } from '../services/api';

// ─── Default seed data (all 13 SEO pages) ─────────────────────────────────────
const DEFAULT_SEED_PAGES = [
  {
    slug: 'tshirt-manufacturer-in-jodhpur', isActive: true,
    h1: 'Custom T-shirt Manufacturing Company in Jodhpur',
    metaTitle: 'T-Shirt Manufacturers and Printing in Jodhpur - The Cross Wild',
    metaDescription: 'Prices start at just Rs. 70. Crosswild is a leading T-shirt manufacturing and supplier company in Jodhpur. We customise and print T-shirts for schools, colleges, events, and promotions at affordable prices.',
    city: 'Jodhpur', category: 'tshirt', categoryLabel: 'T-Shirt',
    branchAddress: 'B-13, Shastri Nagar, Near Shastri Circle, Jodhpur, Rajasthan 342003',
    branchPhone: '+91-9571286262', branchHours: 'Monday–Saturday, 10:00 AM – 6:30 PM',
    mapLink: 'https://maps.google.com/?q=B-13+Shastri+Nagar+Jodhpur',
    showPrintingMethods: true, showFabrics: true, showSizeChart: true,
    introContent: `<p>Crosswild is considered to be the best company for custom t-shirt manufacturing in Jodhpur, where you can get a huge variety of both casual and formal t-shirts. All the t-shirts are made using high-quality fabric, which ensures that it is shrink-resistant and colour-stable. Now, could you promote your brand with customised options with us?</p>\n<p>We are the top t-shirt manufacturing company in Jodhpur, where all the employees are highly trained and use quality printing technology to print on t-shirts. You can find t-shirts with us at wholesale prices in different styles, colours, and sizes according to your requirements.</p>\n<h2>Polo, Sports, Round Neck T-shirt Printing in Jodhpur for School or College</h2>\n<p>If you are looking for T-shirt maker for school or college in Jodhpur then you can come to us as we print T-shirts keeping in mind the different demands of the customers. At Crosswild, you can find unique T-shirts like Polo, Sports, and Round Neck that ensure a perfect fit on the body. And at a better price than the market. Every T-shirt we have has an elegant and attractive look that helps to enhance the look of the wearer.</p>\n<p>We also offer custom jersey or T-shirt printing services in Jodhpur for corporate, personal events and sports events like marathon, cricket, yoga etc. with screen printing as well as sublimation printing.</p>`,
  },
  {
    slug: 'bags-manufacturer-in-jodhpur', isActive: true,
    h1: 'Bags Manufacturing in Jodhpur',
    metaTitle: 'Bags Manufacturers & Supplier in Jodhpur, India - The Crosswild',
    metaDescription: 'Prices start @ Rs 140 only. The Crosswild is leading manufacturer and supplier of School bags, College bags, Laptop bags, Delivery Bags, Office bags and Ladies bags at wholesale price in Jodhpur, India.',
    city: 'Jodhpur', category: 'bags', categoryLabel: 'Bags',
    branchAddress: 'B-13, Shastri Nagar, Near Shastri Circle, Jodhpur, Rajasthan 342003',
    branchPhone: '+91-9571286262', branchHours: 'Monday–Saturday, 10:00 AM – 6:30 PM',
    mapLink: 'https://maps.google.com/?q=B-13+Shastri+Nagar+Jodhpur',
    showPrintingMethods: false, showFabrics: false, showSizeChart: false,
    introContent: `<p>The CrossWild is the superlative bags manufacturing company in Jodhpur where both designing and printing of bags are done. At our organization, bags are the most manufactured products due to which we are known as the topmost bags manufacturing company in Jodhpur.</p>\n<p>The CrossWild has a reputation to complete bulk orders of bags within the time at an affordable price. We manufacture and sell commercial food delivery bags for Zomato, Uber Eats, Swiggy and Corporate (office) bags.</p>\n<h2>Our Complete Range Includes:</h2>\n<p>Our complete range of bags is designed in such a manner that it is sure to reflect your class. With us, you can find different varieties of bags that too at an affordable price. Be it laptop bag, school bag, back bag or gym bag you can find all bags at wholesale price.</p>`,
  },
  {
    slug: 'cap-printing-manufacturer-jodhpur', isActive: true,
    h1: 'Promotional Cap Manufacturing Company in Jodhpur',
    metaTitle: 'Custom Caps Manufacturer for Business Promotion in Jodhpur',
    metaDescription: 'We are a reputed cap manufacturer in Jodhpur, such as promotional caps, convocation caps and caps for sports events. Call 9571286262 for the best deal.',
    city: 'Jodhpur', category: 'caps', categoryLabel: 'Caps',
    branchAddress: 'B-13, Shastri Nagar, Near Shastri Circle, Jodhpur, Rajasthan 342003',
    branchPhone: '+91-9571286262', branchHours: 'Monday–Saturday, 10:00 AM – 6:30 PM',
    mapLink: 'https://maps.google.com/?q=B-13+Shastri+Nagar+Jodhpur',
    showPrintingMethods: false, showFabrics: false, showSizeChart: false,
    introContent: `<p>At Cross Wild, we bring you promotional cap solutions that not only protect your style but will also act as a powerful branding tool for your business. Just imagine someone wearing these and then think about how every glance will become an opportunity to showcase your company's identity.</p>\n<p>We have an extensive manufacturing facility based in Jodhpur — a facility that is finely tuned to deliver quality every time. We also offer a vast range of options for you to choose from — from snapbacks &amp; trucker hats to beanies and more.</p>\n<h2>Why Choose Cross Wild for Bulk Orders of Custom Design Caps in Jodhpur?</h2>\n<p>When it comes to bulk orders of custom designed caps, Cross Wild is the perfect choice. We are one of the best makers in the market with a team of experts who ensure that even the smallest details are perfect.</p>`,
  },
  {
    slug: 'uniform-manufacturer-jodhpur', isActive: true,
    h1: 'Office Staff Uniform, Hospital, Hotel & Resort Dress in Jodhpur',
    metaTitle: 'Uniform Manufacturer with Branding for School, Medical and Hotel in Jodhpur',
    metaDescription: 'We are the leading uniform manufacturer and supplier in Jodhpur with custom design branding for school, medical and industrial needs.',
    city: 'Jodhpur', category: 'uniform', categoryLabel: 'Uniform',
    branchAddress: 'B-13, Shastri Nagar, Near Shastri Circle, Jodhpur, Rajasthan 342003',
    branchPhone: '+91-9571286262', branchHours: 'Monday–Saturday, 10:00 AM – 6:30 PM',
    mapLink: 'https://maps.google.com/?q=B-13+Shastri+Nagar+Jodhpur',
    showPrintingMethods: false, showFabrics: false, showSizeChart: false,
    introContent: `<p>Cross Wild is a leader when it comes to uniform making solutions in Jodhpur. We specialize in not just designing &amp; manufacturing high-quality uniforms, but we actually tailor these to suit your needs. You can choose your brand logo, tagline, or a specific colour scheme integrated into your design.</p>\n<h2>School Uniform Makers for Students and Teachers in Jodhpur</h2>\n<p>As a leading school uniform manufacturer in Jodhpur, we cater to the needs of both students and teaching staff, creating uniforms as per school guidelines without compromising on functionality and comfort.</p>\n<h2>Why Choose Us for Uniform Supplier in Jodhpur?</h2>\n<p>Cross Wild will be a reliable manufacturer for your uniforms in Jodhpur as our in-house team will take care of everything — from design to delivery. Our custom-fit solution guarantees no compromises with the quality.</p>`,
  },
  {
    slug: 'tshirt-manufacturer-in-indore', isActive: true,
    h1: 'Custom T-shirt Manufacturing Company Indore at Affordable Prices',
    metaTitle: 'Promotional Corporate T-shirt Manufacturers in Indore',
    metaDescription: 'The Cross Wild is a leading manufacturer of customized T-shirts for corporate in Indore for advertising events, sports etc. at affordable prices. Call Now',
    city: 'Indore', category: 'tshirt', categoryLabel: 'T-Shirt',
    branchPhone: '+91-9649715050',
    showPrintingMethods: true, showFabrics: true, showSizeChart: true,
    pageImages: ['/images/fileBanners/indore/tshirt/indor-CTA-1.webp', '/images/fileBanners/indore/tshirt/indor-CTA-2.webp'],
    introContent: `<p>What if you are looking for high quality custom t-shirt manufacturer in Indore City? The Cross Wild, one of the leading T-shirts manufacturing company in Indore, will realize your ideas with precision while ensuring style and affordability. From a startup company to a corporate brand or an event organizer, our custom-made T-shirts are a distinctive way to get noticed.</p>\n<p>We know that every brand is distinct, so at The Cross Wild, we offer an eclectic option of customizing from diverse fabrics to colors and sizes to designs, all manufactured from high-grade quality materials and well-advanced printing technology.</p>\n<h2>Why Choose Customized Printed T-shirts for Corporate Advertising Events?</h2>\n<p>Custom printed T-shirts serve as a smart and low-cost means to promote your brand at events, trade shows, or corporate meetups. They differ from traditional forms of advertising in that they have moving, wearable visibility – your logo is on the move with everyone wearing it!</p>`,
  },
  {
    slug: 'bag-manufacturer-in-indore', isActive: true,
    h1: 'Custom Bag Manufacturing Company in Indore At Best Price',
    metaTitle: 'Bag Manufacturers in Indore for Business, Corporate, School with Branding',
    metaDescription: 'We are leading manufacturer and supplier of custom laptop backpacks, food delivery bags, travel bags for corporate in Indore. Contact 9649715050',
    city: 'Indore', category: 'bags', categoryLabel: 'Bags',
    branchPhone: '+91-9649715050',
    showPrintingMethods: false, showFabrics: false, showSizeChart: false,
    pageImages: ['/images/fileBanners/indore/bags/Laptop-CTA-banner.webp', '/images/fileBanners/indore/bags/bags-banner-CTA.webp'],
    introContent: `<p>For everyone, from small startups to large companies, The Cross Wild is a trusted custom bag manufacturing company in Indore offering tailor-made solutions for the brand or business. Our bag designs meet your requirements while keeping your brand identity in mind.</p>\n<p>At The Cross Wild, we manufacture all sorts of bags made with durable materials and expert craftsmanship: from fabric selection to your company name or logo, everything can be customized to reflect your style.</p>\n<h2>Grocery, Gym, Office, School Bags with Company Name and Logo in Indore</h2>\n<p>At The Cross Wild, we manufacture all sorts of custom bags for every need you may have. We focus on printing the names of your company, its logos, and custom designs, thereby giving visibility and professionalism on top of the product.</p>`,
  },
  {
    slug: 'uniform-manufacturer-in-indore', isActive: true,
    h1: 'Sports, School Uniform Manufacturers & Suppliers in Indore',
    metaTitle: 'Best Uniform Makers in Indore for Hospitals, Schools and Corporate',
    metaDescription: 'Are you looking for uniform manufacturer then contact The Cross Wild, a renowned company for manufacturing custom uniforms for hospitals, business, school in Indore at best prices. Inquire Now',
    city: 'Indore', category: 'uniform', categoryLabel: 'Uniform',
    branchPhone: '+91-9649715050',
    showPrintingMethods: false, showFabrics: false, showSizeChart: false,
    pageImages: ['/images/fileBanners/indore/uniform/School-uniform-CTA-banner.webp', '/images/fileBanners/indore/uniform/office-uniform-cta-banner.webp'],
    introContent: `<p>The Cross Wild is a trusted name in the industry among the leading uniform manufacturers and suppliers in Indore. We stand tall for providing durable, comfortable, and finely stitched uniforms for students and athletes.</p>\n<p>We have a team of highly expert people who specialize in creating modern designs. We don't only use high-quality fabrics but also pay attention to details when creating uniforms to meet the branding needs of the organizations.</p>\n<h2>Custom Uniforms for Hospital and Medical Staff in Indore at the Best Price</h2>\n<p>At The Cross Wild, we specialize in creating custom uniforms for hospitals and medical staff. We provide uniforms made of breathable fabric which is not only skin-friendly but also serves comfort for long hours.</p>`,
  },
  {
    slug: 'bags-manufacturing-company-in-udaipur', isActive: true,
    h1: 'Bags Manufacturer in Udaipur',
    metaTitle: 'Bags Manufacturer & Suppliers in Udaipur, India - The Crosswild',
    metaDescription: 'Prices start @ Rs 140 only. The Crosswild is leading manufacturer and wholesale supplier company of bags for School, College, Laptop, Food Delivery, Corporate and Ladies bags at wholesale price in Udaipur, India.',
    city: 'Udaipur', category: 'bags', categoryLabel: 'Bags',
    showPrintingMethods: false, showFabrics: false, showSizeChart: false,
    introContent: `<p>If you are still looking for the best Bags Manufacturer in Udaipur then your search ends here. The CrossWild is considered as the topmost company involved in offering a wide gamut of bags at a very reasonable price.</p>\n<p>All the bags are manufactured using quality material which not only ensures their high strength but also enhanced durability. Be it, bag pack, school bag, laptop bag, gym bag, office bag, travel bag or corporate bag, we are offering everything.</p>\n<p>We also make amazing foldable and unbreakable food delivery bags for different online food delivery websites like Swiggy, Zomato, UberEats as well as EatFit at a very cost-effective price.</p>`,
  },
  {
    slug: 'tshirt-manufacturer-wholesaler-in-udaipur', isActive: true,
    h1: 'T-shirt Manufacturer in Udaipur',
    metaTitle: 'T-Shirt Manufacturer and Wholesaler in Udaipur - The Crosswild',
    metaDescription: 'Prices start @ Rs 70 only. The Crosswild is a leading t-shirt manufacturer and supplier company in Udaipur, Rajasthan. We manufacture customize t-shirts for schools, colleges, events, and promotions at wholesale price.',
    city: 'Udaipur', category: 'tshirt', categoryLabel: 'T-Shirt',
    showPrintingMethods: true, showFabrics: true, showSizeChart: true,
    sliderImages: ['/images/fileBanners/thirtSlider/4.jpg', '/images/fileBanners/thirtSlider/6.jpg', '/images/fileBanners/thirtSlider/IMG_8501.jpg', '/images/fileBanners/thirtSlider/IMG_8508.jpg'],
    introContent: `<p>Nowadays everyone prefers a t-shirt for both formal and casual wear. You can now order t-shirt in bulk from The CrossWild which is known as a reputable T-shirt Manufacturer in Udaipur offering quality t-shirt at a reasonable price.</p>\n<p>All our t-shirts are designed using quality fabric which ensures perfect fitting and high comfort. Before the final dispatch, all the t-shirts are strictly checked on different standards in order to ensure its perfect finish and premium quality.</p>\n<h2>Polo T-shirt:</h2>\n<p>Being the top t-shirt manufacturer, we are offering a wide range of polo t-shirt in different colours, patterns, styles as well as sizes in order to meet the exact requirement of clients.</p>`,
  },
  {
    slug: 'tshirt-manufacturer-wholesaler-in-kota', isActive: true,
    h1: 'T-shirt Manufacturing in Kota',
    metaTitle: 'T-Shirt Manufacturer and Wholesaler in Kota - The Crosswild',
    metaDescription: 'Prices start @ Rs 70 only. The Crosswild is a leading t-shirt manufacturer and supplier company in Kota, India. We manufacture customize t-shirts for schools, colleges, events, and promotions at wholesale price.',
    city: 'Kota', category: 'tshirt', categoryLabel: 'T-Shirt',
    showPrintingMethods: true, showFabrics: true, showSizeChart: true,
    sliderImages: ['/images/fileBanners/thirtSlider/4.jpg', '/images/fileBanners/thirtSlider/6.jpg', '/images/fileBanners/thirtSlider/IMG_8501.jpg', '/images/fileBanners/thirtSlider/IMG_8508.jpg'],
    introContent: `<p>T-shirt is a product that has attracted a lot of attention and has always been popular since it began to be produced in the 1920s. These products are among the most preferred textile products of T-shirt manufacturers in Kota in the hot summer seasons.</p>\n<p>We have types of machinery that empower us to print all custom designs on t-shirts in all types of printing methods. The quality of our fabric and printing is up to the mark that satisfies our customers in their budget.</p>\n<h2>Custom T-Shirt Printing for Events, Schools, Colleges, Promotions and Institutes:</h2>\n<p>When ordering a printed t-shirt supplier for college, our customer representatives assist you in deciding on the appropriate size and preparing the ideal t-shirt. Promotional t-shirts are frequently used as a product that companies distribute in advertising, promotion and promotional activities.</p>`,
  },
  {
    slug: 'bags-manufacturing-company-in-kota', isActive: true,
    h1: 'Bags Manufacturing in Kota',
    metaTitle: 'Bags Manufacturer & Suppliers in Kota, India - The Crosswild',
    metaDescription: 'Prices start @ Rs 140 only. The Crosswild is leading manufacturer and wholesale supplier company of bags for School, College, Laptop, Food Delivery, Corporate and Ladies bags at wholesale price in Kota, India.',
    city: 'Kota', category: 'bags', categoryLabel: 'Bags',
    showPrintingMethods: false, showFabrics: false, showSizeChart: false,
    introContent: `<p>Are you searching for the best bags manufacturing company in Kota? If yes, then your search ends here. Whether you want the food delivery bags, corporate bags, school bags or college bags, you can get everything with us that too at a very competitive price.</p>\n<p>We are known for offering the best quality as well as design bags and also considered as the topmost bags manufacturers in Kota.</p>\n<h2>A Preeminent Company Involved in Bags Manufacturing in Kota:</h2>\n<p>We offer school bags at wholesale price and are made using quality material to ensure its long life. Our complete range of school bags has high strength due to which students can carry their books &amp; copies easily.</p>`,
  },
  {
    slug: 'tshirt-manufacturer-wholesaler-in-sikar', isActive: true,
    h1: 'T-shirt Manufacturing in Sikar',
    metaTitle: 'T-Shirt Manufacturer and Wholesaler in Sikar - The Crosswild',
    metaDescription: 'Prices start @ Rs 70 only. The Crosswild is a leading t-shirt manufacturer and supplier company in Sikar, India. We manufacture customize t-shirts for schools, colleges, events, and promotions at wholesale price.',
    city: 'Sikar', category: 'tshirt', categoryLabel: 'T-Shirt',
    showPrintingMethods: true, showFabrics: true, showSizeChart: true,
    sliderImages: ['/images/fileBanners/thirtSlider/4.jpg', '/images/fileBanners/thirtSlider/6.jpg', '/images/fileBanners/thirtSlider/IMG_8501.jpg', '/images/fileBanners/thirtSlider/IMG_8508.jpg'],
    introContent: `<p>Now order your favourite t-shirt in bulk quantity with a discounted price at The CrossWild. We are recognized as the topmost Tshirt manufacturing company in Sikar where you can find different styles of t-shirt like polo, round neck, promotional, customized and a dry fit sports t-shirt.</p>\n<p>All the t-shirts that are manufactured at our unit are compacted pre-shrunk as well as comes along with a colour fastness assurance.</p>\n<h2>Polo T-shirt:</h2>\n<p>Being the top t-shirt manufacturer in Sikar, we provide polo t-shirts in elegant style, colours, sizes as well as patterns. We can also provide custom polo t-shirt on the demand of our clients.</p>`,
  },
  {
    slug: 'bags-manufacturing-company-in-sikar', isActive: true,
    h1: 'Bags Manufacturing in Sikar',
    metaTitle: 'Bags Manufacturer & Suppliers in Sikar, India - The Crosswild',
    metaDescription: 'Prices start @ Rs 140 only. The Crosswild is leading manufacturer and wholesale supplier company of bags for School, College, Laptop, Food Delivery, Corporate and Ladies bags at wholesale price in Sikar, India.',
    city: 'Sikar', category: 'bags', categoryLabel: 'Bags',
    showPrintingMethods: false, showFabrics: false, showSizeChart: false,
    introContent: `<p>If you are looking for the topmost and best company which is involved in Bags Manufacturing in Sikar then you have arrived absolutely at the right place. The Crosswild Company is indulged in manufacturing a wide assortment of bags at a very reasonable cost.</p>\n<p>All the bags are coated with special chemicals in order to add strength as well as make them waterproof in nature. Be it corporate (office) bags, school bags, food delivery bags or laptop bags, all are designed perfectly.</p>\n<p>Our food delivery bags are considered as the impeccable combination of style with comfort. Our food delivery bags are unbreakable and foldable, while we offer these bags for different food delivery companies like Swiggy, Zomato, Uber Eats and EatFit at a cost-effective price.</p>`,
  },
];

// ─── Empty state ───────────────────────────────────────────────────────────────
const emptyLocation = () => ({
  slug: '', isActive: true,
  h1: '', metaTitle: '', metaDescription: '',
  city: '', category: '', categoryLabel: '',
  image: '',
  introContent: '', mainContent: '',
  pageImages: [],
  sliderImages: [],
  branchAddress: '', branchPhone: '', branchHours: '',
  mapLink: '', mapEmbed: '',
  showPrintingMethods: false, showFabrics: false, showSizeChart: false,
  printingMethods: [], fabrics: [],
});

// ─── Primitive UI ──────────────────────────────────────────────────────────────
const Field = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
      focus:outline-none focus:ring-2 focus:ring-orange-400 ${className}`}
  />
);

const Textarea = ({ className = '', rows = 3, ...props }) => (
  <textarea
    {...props}
    rows={rows}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
      focus:outline-none focus:ring-2 focus:ring-orange-400 resize-vertical ${className}`}
  />
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 rounded" />
    <span className="text-sm font-medium">{label}</span>
  </label>
);

// Editable text-list (printing methods, fabrics, etc.)
const EditableList = ({ items, onChange, placeholder }) => {
  const update = (i, v) => { const a = [...items]; a[i] = v; onChange(a); };
  const add    = () => onChange([...items, '']);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input value={item} onChange={e => update(i, e.target.value)} placeholder={placeholder} />
          <button type="button" onClick={() => remove(i)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="text-sm text-orange-600 hover:underline font-medium">
        + Add item
      </button>
    </div>
  );
};

// Image path list with inline preview
const ImagePathList = ({ items, onChange, placeholder }) => {
  const update = (i, v) => { const a = [...items]; a[i] = v; onChange(a); };
  const add    = () => onChange([...items, '']);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-3">
      {items.map((src, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 space-y-1">
            <Input
              value={src}
              onChange={e => update(i, e.target.value)}
              placeholder={placeholder}
              className="font-mono text-xs"
            />
            {src && (
              <div className="w-full h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={src}
                  alt={`preview ${i + 1}`}
                  className="w-full h-full object-contain"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>
          <button type="button" onClick={() => remove(i)}
            className="mt-1.5 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="flex items-center gap-1 text-sm text-orange-600 hover:underline font-medium">
        <ImageIcon className="w-4 h-4" /> Add image path
      </button>
      <p className="text-xs text-gray-400 leading-relaxed">
        Use paths relative to <code className="bg-gray-100 px-1 rounded">/public</code>, e.g.{' '}
        <code className="bg-gray-100 px-1 rounded">/images/fileBanners/indore/tshirt/indor-CTA-1.webp</code>
      </p>
    </div>
  );
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
const LocationModal = ({ location, onClose, onSaved }) => {
  const isEdit = !!location;

  const [form, setForm] = useState(() => isEdit ? {
    ...emptyLocation(),
    ...location,
    printingMethods: location.printingMethods?.length ? location.printingMethods : [],
    fabrics:         location.fabrics?.length         ? location.fabrics         : [],
    pageImages:      location.pageImages?.length      ? location.pageImages      : [],
    sliderImages:    location.sliderImages?.length    ? location.sliderImages    : [],
  } : emptyLocation());

  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.slug) { setError('Slug is required'); return; }
    if (!form.h1)   { setError('H1 heading is required'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        printingMethods: form.printingMethods.filter(Boolean),
        fabrics:         form.fabrics.filter(Boolean),
        pageImages:      form.pageImages.filter(Boolean),
        sliderImages:    form.sliderImages.filter(Boolean),
      };
      if (isEdit) {
        await locationsAPI.update(location._id, payload);
      } else {
        await locationsAPI.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save. Check all required fields.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic',   label: 'Basic Info' },
    { id: 'seo',     label: 'SEO' },
    { id: 'content', label: 'Content' },
    { id: 'images',  label: 'Images' },
    { id: 'contact', label: 'Contact & Map' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl my-4 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            {isEdit ? `Edit — ${location.h1 || location.slug}` : 'Add New Location Page'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 px-6 pt-3 border-b border-gray-100 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors
                ${activeTab === t.id
                  ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 min-h-[420px]">

            {/* ── BASIC INFO ── */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Slug" required
                    hint={isEdit ? 'Read-only after creation' : 'e.g. tshirt-manufacturer-in-jodhpur'}>
                    <Input
                      value={form.slug}
                      onChange={e => !isEdit && set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="tshirt-manufacturer-in-jodhpur"
                      readOnly={isEdit}
                      className={isEdit ? 'bg-gray-50 text-gray-500 cursor-not-allowed font-mono text-xs' : 'font-mono text-xs'}
                      required
                    />
                  </Field>
                  <Field label="Status">
                    <div className="mt-2">
                      <Checkbox
                        label="Active (visible on site)"
                        checked={form.isActive}
                        onChange={e => set('isActive', e.target.checked)}
                      />
                    </div>
                  </Field>
                </div>

                <Field label="H1 Heading" required hint="Main heading shown on the page">
                  <Input
                    value={form.h1}
                    onChange={e => set('h1', e.target.value)}
                    placeholder="T-Shirt Manufacturer in Jodhpur"
                    required
                  />
                </Field>

                <div className="grid grid-cols-3 gap-4">
                  <Field label="City">
                    <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Jodhpur" />
                  </Field>
                  <Field label="Category (slug)">
                    <Input value={form.category} onChange={e => set('category', e.target.value)} placeholder="tshirts" />
                  </Field>
                  <Field label="Category Label">
                    <Input value={form.categoryLabel} onChange={e => set('categoryLabel', e.target.value)} placeholder="T-Shirts" />
                  </Field>
                </div>

                {/* Page sections toggles */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
                  <p className="text-sm font-semibold text-gray-600">Enable / Disable Page Sections</p>
                  <div className="flex flex-wrap gap-5">
                    <Checkbox label="Show Printing Methods" checked={form.showPrintingMethods} onChange={e => set('showPrintingMethods', e.target.checked)} />
                    <Checkbox label="Show Fabrics"          checked={form.showFabrics}         onChange={e => set('showFabrics', e.target.checked)} />
                    <Checkbox label="Show Size Chart"       checked={form.showSizeChart}       onChange={e => set('showSizeChart', e.target.checked)} />
                  </div>
                </div>

                {form.showPrintingMethods && (
                  <Field label="Printing Methods" hint="Leave empty to use site-wide defaults">
                    <EditableList items={form.printingMethods} onChange={v => set('printingMethods', v)} placeholder="e.g. Screen Printing" />
                  </Field>
                )}

                {form.showFabrics && (
                  <Field label="Fabric Options" hint="Leave empty to use site-wide defaults">
                    <EditableList items={form.fabrics} onChange={v => set('fabrics', v)} placeholder="e.g. 100% Cotton" />
                  </Field>
                )}
              </div>
            )}

            {/* ── SEO ── */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <Field label="Meta Title" hint={`${form.metaTitle?.length || 0} / 70 characters — shown in Google search results`}>
                  <Input
                    value={form.metaTitle}
                    onChange={e => set('metaTitle', e.target.value)}
                    placeholder="T-Shirt Manufacturer in Jodhpur | The CrossWild"
                  />
                  <div className="mt-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (form.metaTitle?.length || 0) > 70 ? 'bg-red-500' :
                        (form.metaTitle?.length || 0) > 55 ? 'bg-orange-400' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, ((form.metaTitle?.length || 0) / 70) * 100)}%` }}
                    />
                  </div>
                </Field>

                <Field label="Meta Description" hint={`${form.metaDescription?.length || 0} / 160 characters — shown below the title in Google`}>
                  <Textarea
                    value={form.metaDescription}
                    onChange={e => set('metaDescription', e.target.value)}
                    placeholder="Looking for a reliable t-shirt manufacturer in Jodhpur? The CrossWild offers bulk custom t-shirts at affordable prices..."
                    rows={4}
                  />
                  <div className="mt-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (form.metaDescription?.length || 0) > 160 ? 'bg-red-500' :
                        (form.metaDescription?.length || 0) > 130 ? 'bg-orange-400' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, ((form.metaDescription?.length || 0) / 160) * 100)}%` }}
                    />
                  </div>
                </Field>

                {/* Google SERP Preview */}
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Google Search Preview</p>
                  <p className="text-[13px] text-blue-700 font-medium truncate">
                    {form.metaTitle || form.h1 || 'Page Title'}
                  </p>
                  <p className="text-[12px] text-green-700">
                    https://thecrosswild.com/{form.slug || 'page-slug'}
                  </p>
                  <p className="text-[12px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                    {form.metaDescription || 'Meta description will appear here...'}
                  </p>
                </div>
              </div>
            )}

            {/* ── CONTENT ── */}
            {activeTab === 'content' && (
              <div className="space-y-5">
                <Field label="Intro Content (HTML)"
                  hint="Shown on the left column of the page. Supports <h2>, <p>, <strong>, <ul>, <li>, etc.">
                  <Textarea
                    value={form.introContent}
                    onChange={e => set('introContent', e.target.value)}
                    placeholder={'<h2>T-Shirt Manufacturing in Jodhpur</h2>\n<p>We are a leading...</p>\n<ul>\n  <li><strong>Fast delivery</strong></li>\n  <li>Starting at ₹70</li>\n</ul>'}
                    rows={14}
                    className="font-mono text-xs"
                  />
                </Field>

                <Field label="Main Content (HTML)"
                  hint="Shown below the banner images. Use for additional sections, FAQs, etc.">
                  <Textarea
                    value={form.mainContent}
                    onChange={e => set('mainContent', e.target.value)}
                    placeholder={'<h3>Why Choose CrossWild?</h3>\n<p>We offer...</p>'}
                    rows={14}
                    className="font-mono text-xs"
                  />
                </Field>

                {/* Quick tag reference */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-2">HTML Tag Reference</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-blue-600 font-mono">
                    <span>&lt;h2&gt;Heading&lt;/h2&gt;</span>
                    <span>&lt;strong&gt;Bold&lt;/strong&gt;</span>
                    <span>&lt;h3&gt;Sub-heading&lt;/h3&gt;</span>
                    <span>&lt;em&gt;Italic&lt;/em&gt;</span>
                    <span>&lt;p&gt;Paragraph&lt;/p&gt;</span>
                    <span>&lt;a href="..."&gt;Link&lt;/a&gt;</span>
                    <span>&lt;ul&gt;&lt;li&gt;...&lt;/li&gt;&lt;/ul&gt;</span>
                    <span>&lt;ol&gt;&lt;li&gt;...&lt;/li&gt;&lt;/ol&gt;</span>
                    <span>&lt;br/&gt; — line break</span>
                    <span>&lt;blockquote&gt;Quote&lt;/blockquote&gt;</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── IMAGES ── */}
            {activeTab === 'images' && (
              <div className="space-y-6">

                <Field label="Hero Banner Image" hint="Full-width image shown at the top of the page (URL or /images/... path)">
                  <Input
                    value={form.image}
                    onChange={e => set('image', e.target.value)}
                    placeholder="/images/fileBanners/indore/tshirt/indor-CTA-1.webp or https://..."
                  />
                  {form.image && (
                    <div className="mt-2 w-full h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={form.image} alt="hero preview" className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                </Field>

                <Field label="Mid-Content Banner Images"
                  hint="CTA banners shown between intro content and main content (full-width)">
                  <ImagePathList
                    items={form.pageImages}
                    onChange={v => set('pageImages', v)}
                    placeholder="/images/fileBanners/indore/bags/Laptop-CTA-banner.webp"
                  />
                </Field>

                <Field label="Product Image Slider"
                  hint="4-up image carousel shown in the content area. Add multiple product photos.">
                  <ImagePathList
                    items={form.sliderImages}
                    onChange={v => set('sliderImages', v)}
                    placeholder="/images/fileBanners/thirtSlider/4.jpg"
                  />
                </Field>

                {/* Available image folders hint */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-700 mb-2">📁 Available Image Folders</p>
                  <div className="space-y-0.5 text-xs font-mono text-amber-700">
                    <p>/images/fileBanners/indore/tshirt/</p>
                    <p>/images/fileBanners/indore/bags/</p>
                    <p>/images/fileBanners/indore/uniform/</p>
                    <p>/images/fileBanners/thirtSlider/</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── CONTACT & MAP ── */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <Field label="Branch Address">
                  <Textarea
                    value={form.branchAddress}
                    onChange={e => set('branchAddress', e.target.value)}
                    placeholder="D-8, Near World Trade Park, Malviya Nagar, Jaipur"
                    rows={2}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Branch Phone">
                    <Input value={form.branchPhone} onChange={e => set('branchPhone', e.target.value)} placeholder="+91-9571815050" />
                  </Field>
                  <Field label="Working Hours">
                    <Input value={form.branchHours} onChange={e => set('branchHours', e.target.value)} placeholder="Mon–Sat, 9 AM – 7:30 PM" />
                  </Field>
                </div>
                <Field label="Google Maps Link" hint="Opens in Google Maps when user clicks 'Get Directions'">
                  <Input
                    value={form.mapLink}
                    onChange={e => set('mapLink', e.target.value)}
                    placeholder="https://maps.google.com/?q=The+CrossWild+Jaipur"
                  />
                </Field>
                <Field label="Google Maps Embed URL"
                  hint="Get this from: Google Maps → Share → Embed a map → copy the src URL">
                  <Input
                    value={form.mapEmbed}
                    onChange={e => set('mapEmbed', e.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                </Field>
                {form.mapEmbed && (
                  <div className="rounded-xl overflow-hidden border border-gray-200 h-52">
                    <iframe
                      src={form.mapEmbed}
                      className="w-full h-full border-0"
                      loading="lazy"
                      title="Map preview"
                    />
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          {error && (
            <p className="px-6 pb-2 text-sm text-red-600 font-medium bg-red-50 py-2 border-t border-red-100">
              ⚠ {error}
            </p>
          )}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button type="button" onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : isEdit ? 'Update Page' : 'Create Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [seeding,   setSeeding]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [search,    setSearch]    = useState('');

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await locationsAPI.getAll();
      setLocations(data.locations || []);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleDelete = async (loc) => {
    if (!window.confirm(`Delete "${loc.h1 || loc.slug}"?\n\nThis cannot be undone.`)) return;
    try {
      await locationsAPI.delete(loc._id);
      fetchLocations();
    } catch {
      alert('Failed to delete location page');
    }
  };

  const handleSeed = async () => {
    if (!window.confirm(
      `This will upsert all 13 default location pages into the database.\n\nExisting pages with matching slugs will be updated. New slugs will be created.\n\nContinue?`
    )) return;
    try {
      setSeeding(true);
      const result = await locationsAPI.seed(DEFAULT_SEED_PAGES);
      alert(`Done! ${result.results?.length || 13} pages seeded successfully.`);
      fetchLocations();
    } catch (err) {
      alert('Seed failed: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSeeding(false);
    }
  };

  // Show all location docs — no filtering by schema type
  const filtered = locations.filter(l =>
    !search ||
    (l.h1 || l.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.city || l.state || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.categoryLabel || l.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-orange-500" /> SEO Location Pages
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {locations.length} page{locations.length !== 1 ? 's' : ''} — manage content, SEO, images & map
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            title="Upsert all 13 default pages from seed data"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {seeding ? 'Seeding...' : 'Seed All Pages'}
          </button>
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Page
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by city, category, or slug..."
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No pages found</p>
          {search && <p className="text-sm mt-1">Try clearing the search</p>}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-5 py-3 font-semibold text-gray-600">H1 / Slug</th>
                <th className="px-4 py-3 font-semibold text-gray-600">City</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">Status</th>
                <th className="px-5 py-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(loc => (
                <tr key={loc._id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800 leading-snug">{loc.h1 || '—'}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{loc.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{loc.city || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{loc.categoryLabel || loc.category || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {loc.isActive !== false ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        <Eye className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">
                        <EyeOff className="w-3 h-3" /> Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <a
                        href={`https://the-cross-wild.vercel.app/${loc.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View on site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => { setEditing(loc); setShowModal(true); }}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <LocationModal
          location={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { setShowModal(false); setEditing(null); fetchLocations(); }}
        />
      )}
    </div>
  );
};

export default Locations;
