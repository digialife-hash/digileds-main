import SocialMediaManagementForm from "./SocialMediaManagementForm";
import WebsiteDevelopmentForm from "./WebsiteDevelopmentForm";
import SeoDetailsForm from "./SeoDetailsForm";
import BrandingDetailsForm from "./BrandingDetailsForm";
import ContentWritingForm from "./ContentWritingForm";
import VideoEditingForm from "./VideoEditingForm";
import CustomServiceDetailsForm from "./CustomServiceDetailsForm";

export const serviceFormConfig = {
  social_media_management: SocialMediaManagementForm,
  website_development: WebsiteDevelopmentForm,
  seo: SeoDetailsForm,
  paid_advertising: SocialMediaManagementForm, // Paid advertising sections included inside SMM / Ad form
  branding: BrandingDetailsForm,
  content_writing: ContentWritingForm,
  video_editing: VideoEditingForm,
  custom_service: CustomServiceDetailsForm,
};

export const getServiceFormComponent = (serviceType) => {
  return serviceFormConfig[serviceType] || CustomServiceDetailsForm;
};

export default serviceFormConfig;
