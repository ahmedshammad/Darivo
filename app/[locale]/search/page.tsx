import { Search } from '@/src/components/search';
import { optionalUser } from '@/src/server/security';
import { searchProperties } from '@/src/server/db/properties';
export default async function Page() {
  return <Search initial={await searchProperties({}, await optionalUser())} />;
}
