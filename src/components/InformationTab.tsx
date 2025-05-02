import React from 'react';

const InformationTab: React.FC = () => {
  const styles = {
    tabContent: {
      padding: '20px',
      backgroundColor: '#f8fafc'
    },
    container: {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
      padding: '32px',
      marginBottom: '24px',
      borderTop: '4px solid #d03027'
    },
    mainTitle: {
      fontSize: '30px',
      fontWeight: 'bold',
      color: '#d03027',
      marginBottom: '24px',
      letterSpacing: '-0.5px'
    },
    methodologySection: {
      marginBottom: '40px',
      backgroundColor: '#ffffff',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f1f5f9'
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#003057',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '1px solid #e2e8f0'
    },
    paragraph: {
      color: '#4b5563',
      marginBottom: '16px',
      lineHeight: '1.7'
    },
    segmentContainer: {
      marginBottom: '40px'
    },
    segmentCard: {
      marginBottom: '32px',
      backgroundColor: '#ffffff',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      borderLeft: '4px solid #003057',
      transition: 'box-shadow 0.3s'
    },
    segmentTitle: {
      fontSize: '20px',
      fontWeight: '500',
      color: '#d03027',
      marginBottom: '12px'
    },
    subsegmentTitle: {
      color: '#374151',
      marginBottom: '12px',
      fontWeight: '500'
    },
    bulletList: {
      listStyle: 'none',
      padding: '0',
      margin: '0',
      color: '#003057'
    },
    bulletItem: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '8px'
    },
    bulletPoint: {
      width: '8px',
      height: '8px',
      backgroundColor: '#003057',
      borderRadius: '50%',
      marginRight: '10px',
      marginTop: '8px',
      flexShrink: '0'
    },
    bulletTitle: {
      fontWeight: '600',
      color: '#003057'
    }
  };

  return (
    <div style={styles.tabContent}>
      <div style={styles.container}>
        <h1 style={styles.mainTitle}>Capital One Audience Segmentation Analysis</h1>
        
        <section style={styles.methodologySection}>
          <h2 style={styles.sectionTitle}>Methodology</h2>
          <p style={styles.paragraph}>
            Our team conducted an extensive analysis of Capital One's advertising strategy by scraping and analyzing over 250,000 ad placements containing more than 1,200 unique advertisements from 2024. Using advanced AI and natural language processing, we extracted and analyzed text transcripts, visual elements, product placements, and messaging themes across multiple platforms. This comprehensive dataset allowed us to identify distinct audience segments based on the specific language, imagery, benefits, and product features emphasized across Capital One's marketing communications. By categorizing these targeting patterns, we've developed a framework that reveals how Capital One strategically positions its various financial products to different customer groups.
          </p>
        </section>

        <section style={styles.segmentContainer}>
          <h2 style={styles.sectionTitle}>Audience Segments</h2>
          
          <div style={styles.segmentCard}>
            <h3 style={styles.segmentTitle}>Consumer · Financial Goals</h3>
            <p style={styles.paragraph}>
              This segment focuses on individuals with specific financial objectives who are actively working to improve their financial situation. They are motivated by concrete outcomes like savings growth, debt reduction, or establishing credit.
            </p>
            <p style={styles.subsegmentTitle}>Sub-segments include:</p>
            <ul style={styles.bulletList}>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Savings Seekers:</span> Individuals looking to grow their money through high-yield savings accounts, CDs, and performance savings</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Deal Hunters:</span> Online shoppers seeking discounts and promo codes through Capital One Shopping</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Credit Builders:</span> Consumers looking to establish or improve their credit score</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Fee Avoiders:</span> People specifically seeking banking products without fees or minimum balances</div>
              </li>
            </ul>
          </div>

          <div style={styles.segmentCard}>
            <h3 style={styles.segmentTitle}>Consumer · Banking Preferences</h3>
            <p style={styles.paragraph}>
              This segment prioritizes specific banking experiences and service attributes rather than financial outcomes. They value how they interact with their financial institution and the quality of those interactions.
            </p>
            <p style={styles.subsegmentTitle}>Sub-segments include:</p>
            <ul style={styles.bulletList}>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Convenience Seekers:</span> Consumers valuing easy, hassle-free banking solutions</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Digital Banking Users:</span> Tech-savvy individuals preferring mobile banking solutions</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Security-Focused:</span> Consumers concerned with account protection and identity theft prevention</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>No-Hassle Bankers:</span> People seeking straightforward banking without complicated terms</div>
              </li>
            </ul>
          </div>

          <div style={styles.segmentCard}>
            <h3 style={styles.segmentTitle}>Consumer · Shopping & Products</h3>
            <p style={styles.paragraph}>
              This segment focuses on product-specific benefits and rewards tied to their spending habits. They view financial products primarily as tools to enhance their purchasing power.
            </p>
            <p style={styles.subsegmentTitle}>Sub-segments include:</p>
            <ul style={styles.bulletList}>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Rewards Maximizers:</span> Consumers seeking cashback, points, or miles from purchases</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Retail Shoppers:</span> Customers who shop frequently at specific retailers (Walmart, Amazon, etc.)</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Travel Spenders:</span> Individuals focusing on travel rewards and benefits</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Big-Ticket Buyers:</span> Auto shoppers and consumers making major purchases</div>
              </li>
            </ul>
          </div>

          <div style={styles.segmentCard}>
            <h3 style={styles.segmentTitle}>Consumer · Lifestyle & Interests</h3>
            <p style={styles.paragraph}>
              This niche segment targets consumers based on specific life situations, activities, or demographics rather than purely financial considerations.
            </p>
            <p style={styles.subsegmentTitle}>Sub-segments include:</p>
            <ul style={styles.bulletList}>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Young Families:</span> Parents looking for teen banking and family financial solutions</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Travelers/Adventurers:</span> Consumers valuing premium travel experiences</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Sports Enthusiasts:</span> Fans of specific sports like baseball or basketball</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Students:</span> Young consumers balancing education and financial needs</div>
              </li>
            </ul>
          </div>

          <div style={styles.segmentCard}>
            <h3 style={styles.segmentTitle}>Business · Owner & Growth</h3>
            <p style={styles.paragraph}>
              This business-focused segment targets entrepreneurs and professionals managing business finances, with emphasis on tools that support operations and growth.
            </p>
            <p style={styles.subsegmentTitle}>Sub-segments include:</p>
            <ul style={styles.bulletList}>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Small Business Owners:</span> Entrepreneurs seeking business credit cards and cash management</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Business Travelers:</span> Professionals looking to maximize travel rewards</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Industry-Specific:</span> Businesses in construction, agriculture, food service, etc.</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Growth-Focused:</span> Businesses seeking financial solutions for expansion</div>
              </li>
            </ul>
          </div>

          <div style={styles.segmentCard}>
            <h3 style={styles.segmentTitle}>Workforce & Employment</h3>
            <p style={styles.paragraph}>
              This segment focuses on Capital One's employer brand, targeting potential employees and highlighting workplace culture.
            </p>
            <p style={styles.subsegmentTitle}>Sub-segments include:</p>
            <ul style={styles.bulletList}>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Job Seekers:</span> Individuals looking for careers at Capital One</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Diverse Candidates:</span> Including veterans and people with disabilities</div>
              </li>
              <li style={styles.bulletItem}>
                <span style={styles.bulletPoint}></span>
                <div><span style={styles.bulletTitle}>Tech Professionals:</span> Especially those in cybersecurity and software development</div>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InformationTab; 