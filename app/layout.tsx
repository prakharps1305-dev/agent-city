import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Agent City — Put your idea in good company',description:'A visual stress test for your next idea. Explore different perspectives, find friction, and ask the people who matter.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
