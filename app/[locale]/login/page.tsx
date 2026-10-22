import {Login} from '@/src/components/login';
export default function Page(){return <Login demo={process.env.DEMO_MODE==='true'&&process.env.NODE_ENV!=='production'}/>;}
