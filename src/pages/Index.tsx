import WindowsDialog from '@/components/WindowsDialog';
import backgroundImage from '@/assets/background.png';

const Index = () => {
  const handleButtonClick = () => {
    window.location.href = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3WcLXj_rxJYYZYzI8LmOHPkI3nCnJSg4M-g&s';
  };

  return (
    <main 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <WindowsDialog
        title="hello tsibkti"
        subtitle="(Best viewed on iOS fs fs)"
        message="where did you gooo"
        buttonText="You Goofy"
        onClick={handleButtonClick}
      />
    </main>
  );
};

export default Index;
