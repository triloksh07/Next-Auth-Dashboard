import Script from 'next/script';

type GoogleAnalyticsProps = {
  ga_id: string;
};

const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ ga_id }) => (
  <>
    <Script async src={`https://www.googletagmanager.com/gtag/js?id=${ga_id}`} />
    <Script
      id="google-analytics"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${ga_id}');
        `,
      }}
    />
  </>
);

export default GoogleAnalytics;
