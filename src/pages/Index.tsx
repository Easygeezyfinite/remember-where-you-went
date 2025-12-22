import WindowsDialog from '@/components/WindowsDialog';
import backgroundImage from '@/assets/background.png';

const Index = () => {
  const handleButtonClick = () => {
    // Could navigate somewhere or show another dialog
    console.log('Button clicked!');
  };

  return (
    <main 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <WindowsDialog
        title="hello room"
        subtitle="(Best viewed on desktop with a 16:9 monitor)"
        message="where did you gooo"
        buttonText="you goofy"
        onClick={handleButtonClick}
      />
    </main>
  );
};

export default Index;
