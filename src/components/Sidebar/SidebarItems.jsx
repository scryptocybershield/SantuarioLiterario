import Library from "./Library";
import Discover from "./Discover";
import Journal from "./Journal";
import Progress from "./Progress";
import ProfileLink from "./ProfileLink";

const SidebarItems = () => {
  return (
    <>
      <Library />
      <Discover />
      <Journal />
      <Progress />
      <ProfileLink />
    </>
  );
};

export default SidebarItems;
