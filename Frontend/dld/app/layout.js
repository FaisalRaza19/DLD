import "./globals.css";
import Main from "@/Components/Main.jsx";
import { AppProvider } from "@/Context/Context";

export const metadata = {
  title: "DLD Web App",
  description: "Professional DLD Web App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Main>{children}</Main>
        </AppProvider>
      </body>
    </html>
  );
}
