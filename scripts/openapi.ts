import { writeFileSync } from 'node:fs';
import { z } from 'zod';
import { filterSchema } from '../src/server/db/properties';
import { briefSchema, toolSchemas } from '../src/server/ai/schema';
import { listingInput } from '../src/server/admin';
import { profileSchema, displayPreferencesSchema } from '../src/lib/preferences';
import { Role } from '@prisma/client';
import { conciergeRequestSchema } from '../src/lib/concierge-transport';
import {
  conciergeReplaySchema,
  conciergeStreamEventSchema,
  writeConfirmationSchema,
} from '../src/lib/concierge';
import * as office from '../src/lib/office';
import { storyDTOSchema, storySummarySchema } from '../src/lib/story';
const convert = (schema: z.ZodType) => {
  const result = z.toJSONSchema(schema, { io: 'input', target: 'draft-7' });
  delete result.$schema;
  return result;
};
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
function compactSchema(name: string, schema: z.ZodType) {
  const result = z.toJSONSchema(schema, { io: 'input', target: 'draft-2020-12', reused: 'ref' });
  delete result.$schema;
  // Definitions remain within this component; JSON pointers are document-relative.
  return JSON.parse(
    JSON.stringify(result).replaceAll('"#/$defs/', `"#/components/schemas/${name}/$defs/`),
  ) as unknown;
}
const str = { type: 'string' },
  num = { type: 'number' },
  bool = { type: 'boolean' };
const array = (items: unknown) => ({ type: 'array', items });
const object = (
  properties: Record<string, unknown>,
  required: string[] = Object.keys(properties),
) => ({ type: 'object', properties, required });
const schemas: Record<string, unknown> = {
  Error: object({ error: str, fields: array(str) }, ['error']),
  Translation: object({ locale: { enum: ['en', 'ar'] }, title: str, description: str }),
  Property: object({
    id: str,
    slug: str,
    type: str,
    status: { enum: ['ready', 'off_plan'] },
    bedrooms: { type: 'integer' },
    bathrooms: { type: 'integer' },
    areaSqm: num,
    priceMinor: {
      type: 'string',
      pattern: '^[0-9]+$',
      description: 'Integer minor units encoded as string',
    },
    currency: str,
    priceAed: num,
    serviceChargeMinor: { type: 'integer' },
    view: str,
    furnishing: str,
    branded: bool,
    amenities: array(str),
    visibility: { enum: ['PUBLIC', 'VERIFIED_ONLY', 'PRIVATE_INVITE'] },
    verification: { enum: ['UNVERIFIED', 'PENDING', 'VERIFIED'] },
    permitNumber: str,
    lastVerifiedAt: { type: 'string', format: 'date-time' },
    goldenVisa: bool,
    lat: num,
    lng: num,
    translations: array(ref('Translation')),
    media: array(
      object({ id: str, url: str, altEn: str, altAr: str, position: { type: 'integer' } }),
    ),
    community: object({
      id: str,
      nameEn: str,
      nameAr: str,
      city: object({ id: str, nameEn: str, nameAr: str, countryId: str }),
    }),
    developer: object({
      id: str,
      nameEn: str,
      nameAr: str,
      descriptionEn: str,
      descriptionAr: str,
    }),
  }),
  SearchResponse: object({ properties: array(ref('Property')), total: { type: 'integer' } }),
  Filters: convert(filterSchema),
  Brief: convert(briefSchema),
  ConciergeRequest: compactSchema('ConciergeRequest', conciergeRequestSchema),
  ConciergeReplay: compactSchema('ConciergeReplay', conciergeReplaySchema),
  ConciergeEvent: compactSchema('ConciergeEvent', conciergeStreamEventSchema),
  ConciergeConfirmation: compactSchema('ConciergeConfirmation', writeConfirmationSchema),
  ListingInput: convert(listingInput),
  Shortlist: object({
    id: str,
    name: str,
    properties: array(ref('Property')),
    createdAt: { type: 'string', format: 'date-time' },
  }),
  SaveShortlist: convert(toolSchemas.save_to_shortlist),
  ViewingInput: convert(toolSchemas.request_viewing),
  InvestmentInput: convert(toolSchemas.calculate_investment),
  ProfileInput: convert(profileSchema),
  DisplayPreferencesInput: { ...convert(displayPreferencesSchema), minProperties: 1 },
  DisplayPreferences: object({ currency: str, areaUnit: str, arabicIndicDigits: bool }),
  Profile: object({
    language: str,
    currency: str,
    areaUnit: str,
    arabicIndicDigits: bool,
    timezone: str,
    notifications: bool,
    consentAt: { type: ['string', 'null'], format: 'date-time' },
  }),
  Grant: object({ userId: str, propertyId: str }),
  Viewing: object({
    id: str,
    propertyId: str,
    slots: array({ type: 'string', format: 'date-time' }),
    timezone: str,
    mode: { enum: ['in_person', 'video'] },
    status: { enum: ['REQUESTED', 'CONFIRMED', 'DECLINED', 'CANCELLED'] },
    property: ref('Property'),
  }),
  Developer: object({ id: str, nameEn: str, nameAr: str, descriptionEn: str, descriptionAr: str }),
  Community: object({ id: str, cityId: str, nameEn: str, nameAr: str, lat: num, lng: num }),
  Media: object({
    id: str,
    propertyId: str,
    url: { type: 'string', pattern: '^/art/property-[0-5]\\.svg$' },
    altEn: str,
    altAr: str,
    position: { type: 'integer', minimum: 0, maximum: 20 },
  }),
  User: object({
    id: str,
    email: { type: 'string', format: 'email' },
    role: { enum: Object.values(Role) },
    verification: { enum: ['UNVERIFIED', 'PENDING', 'VERIFIED'] },
  }),
  UserInput: object({
    id: str,
    role: { enum: Object.values(Role) },
    verification: { enum: ['UNVERIFIED', 'PENDING', 'VERIFIED'] },
  }),
  AuditEvent: object({
    id: str,
    actorId: str,
    action: str,
    targetId: str,
    createdAt: { type: 'string', format: 'date-time' },
  }),
  ToolResult: object(
    {
      kind: str,
      properties: array(ref('Property')),
      data: { type: 'object', additionalProperties: true },
    },
    ['kind', 'properties'],
  ),
  AdvisorAction: {
    oneOf: [
      object({
        action: { const: 'note' },
        clientId: str,
        content: { type: 'string', maxLength: 2000 },
      }),
      object({ action: { const: 'suggest' }, clientId: str, propertyId: str, shortlistName: str }),
      object({
        action: { const: 'viewing' },
        id: str,
        status: { enum: ['CONFIRMED', 'DECLINED', 'CANCELLED'] },
      }),
      object({ action: { const: 'handoff' }, id: str, status: { enum: ['OPEN', 'RESOLVED'] } }),
    ],
  },
  AdvisorInbox: object({
    clients: array({ type: 'object' }),
    viewings: array(ref('Viewing')),
    handoffs: array({ type: 'object' }),
    privateProperties: array({ type: 'object' }),
    grants: array(ref('Grant')),
  }),
  Analytics: object({
    properties: { type: 'integer' },
    users: { type: 'integer' },
    events: array(object({ kind: str, _count: { type: 'integer' } })),
    areas: array(object({ areaId: { type: ['string', 'null'] }, _count: { type: 'integer' } })),
  }),
};
const paths: Record<string, Record<string, unknown>> = {};
function op(
  path: string,
  method: string,
  id: string,
  summary: string,
  response: unknown,
  body?: unknown,
  roles = 'CLIENT',
  parameters: unknown[] = [],
  contentType = 'application/json',
  successStatus?: number,
) {
  const optional = roles === 'PUBLIC';
  const content = { [contentType]: { schema: response } };
  const errorResponses = Object.fromEntries(
    [400, 401, 403, 404, 409, 413, 429, 500].map((code) => [
      code,
      {
        description: 'See Error schema and API.md',
        content: { 'application/json': { schema: ref('Error') } },
      },
    ]),
  );
  paths[path] ??= {};
  paths[path][method] = {
    operationId: id,
    summary,
    description: `Required role: ${roles}. Mutations require same-origin Origin header.`,
    security: optional ? [{}, { SessionCookie: [] }] : [{ SessionCookie: [] }],
    parameters,
    ...(body
      ? { requestBody: { required: true, content: { 'application/json': { schema: body } } } }
      : {}),
    responses: {
      [successStatus ??
      (method === 'post' && ['/shortlists', '/viewings'].includes(path) ? '201' : '200')]: {
        description: 'Successful operation',
        content,
      },
      ...errorResponses,
    },
  };
}
const idParam = { in: 'path', name: 'id', required: true, schema: str };
const idQuery = { in: 'query', name: 'id', required: true, schema: str };
const ok = object({ saved: bool }, []);
op(
  '/concierge',
  'get',
  'conciergeHistory',
  'Re-authorized history snapshot; no replayed actions',
  ref('ConciergeReplay'),
);
op(
  '/concierge',
  'delete',
  'deleteConciergeHistory',
  'Delete history and memory; return a new empty session',
  ref('ConciergeReplay'),
);
op(
  '/concierge',
  'post',
  'conciergeTurn',
  'Stream SDK UI data events for a grounded Concierge turn',
  {
    type: 'string',
    description:
      'Vercel AI SDK SSE frames. data-concierge chunks contain ConciergeEvent; finishes with [DONE].',
    'x-event-schema': ref('ConciergeEvent'),
  },
  ref('ConciergeRequest'),
  'PUBLIC',
  [],
  'text/event-stream',
);
op(
  '/concierge/confirm',
  'post',
  'confirmConciergeAction',
  'Explicitly confirm or reject an owned server-held proposal',
  object({ status: { enum: ['CONFIRMED', 'REJECTED'] }, result: { type: 'object' } }, ['status']),
  ref('ConciergeConfirmation'),
);
const filterJson = convert(filterSchema) as { properties: Record<string, unknown> };
op(
  '/properties',
  'get',
  'searchProperties',
  'Curated structured and hybrid search',
  ref('SearchResponse'),
  undefined,
  'PUBLIC',
  Object.entries(filterJson.properties)
    .filter(([name]) => name !== 'amenities')
    .map(([name, schema]) => ({ in: 'query', name, schema, required: false })),
);
op(
  '/properties/{id}',
  'get',
  'getProperty',
  'Fetch one visible property',
  ref('Property'),
  undefined,
  'PUBLIC',
  [idParam],
);
op(
  '/compare',
  'get',
  'compareProperties',
  'Compare up to four visible IDs',
  array(ref('Property')),
  undefined,
  'PUBLIC',
  [
    {
      in: 'query',
      name: 'ids',
      required: true,
      schema: { type: 'string', description: 'Comma-separated IDs; maximum four' },
    },
  ],
);
op('/brief', 'get', 'getBrief', 'Read current brief', ref('Brief'));
op('/brief', 'patch', 'updateBrief', 'Replace current brief', ref('Brief'), ref('Brief'));
op(
  '/consultant',
  'get',
  'getHistory',
  'Read scoped conversation history',
  object({
    messages: array(object({ id: str, role: str, text: str, properties: array(ref('Property')) })),
    brief: ref('Brief'),
  }),
);
op(
  '/consultant',
  'post',
  'consultantTurn',
  'Stream validated consultant events',
  {
    type: 'string',
    description: 'NDJSON status/brief/text/properties/results/done/error events. See API.md.',
  },
  object({
    message: { type: 'string', minLength: 1, maxLength: 4000 },
    locale: { enum: ['en', 'ar'] },
  }),
  'CLIENT',
  [],
  'application/x-ndjson',
);
op(
  '/consultant',
  'delete',
  'deleteHistory',
  'Delete current user conversations',
  object({ deleted: bool }),
);
op(
  '/shortlists',
  'get',
  'listShortlists',
  'List current user collections',
  array(ref('Shortlist')),
);
op(
  '/shortlists',
  'post',
  'saveShortlist',
  'Save visible residences',
  ref('ToolResult'),
  ref('SaveShortlist'),
);
op(
  '/shortlists/{id}',
  'patch',
  'renameShortlist',
  'Rename owned collection',
  object({ updated: { type: 'integer' } }),
  object({ name: { type: 'string', minLength: 1, maxLength: 80 } }),
  'CLIENT',
  [idParam],
);
op(
  '/shortlists/{id}',
  'delete',
  'deleteShortlist',
  'Delete collection or one item',
  object({ deleted: { type: 'integer' } }),
  undefined,
  'CLIENT',
  [idParam, { in: 'query', name: 'property', required: false, schema: str }],
);
op(
  '/shortlists/{id}/pdf',
  'get',
  'exportDossier',
  'Export up to 24 visible properties as bilingual A4 dossier',
  { type: 'string', format: 'binary' },
  undefined,
  'CLIENT',
  [idParam],
  'application/pdf',
);
op('/viewings', 'get', 'listViewings', 'List current user viewings', array(ref('Viewing')));
op(
  '/viewings',
  'post',
  'requestViewing',
  'Request future private viewing',
  ref('ToolResult'),
  ref('ViewingInput'),
);
op(
  '/investment',
  'post',
  'calculateInvestment',
  'Compute illustrative estimates',
  ref('ToolResult'),
  ref('InvestmentInput'),
);
op(
  '/profile',
  'get',
  'getProfile',
  'Read current profile',
  object({ email: str, verification: str, profile: ref('Profile') }),
);
op(
  '/profile',
  'patch',
  'updateProfile',
  'Save current profile and consent',
  ref('Profile'),
  ref('ProfileInput'),
);
op(
  '/preferences',
  'patch',
  'updateDisplayPreferences',
  'Save currency, area unit and numeral preference without changing consent or access',
  ref('DisplayPreferences'),
  ref('DisplayPreferencesInput'),
  'AUTHENTICATED',
);
op(
  '/profile',
  'delete',
  'deleteAccount',
  'Delete current account and personal workflows',
  object({ deleted: bool }),
);
op(
  '/verification',
  'post',
  'requestVerification',
  'Submit synthetic verification placeholder',
  object({ status: { const: 'PENDING' } }),
  object({ placeholder: { const: 'synthetic-placeholder' }, consent: { const: true } }),
);
op(
  '/advisor',
  'get',
  'advisorInbox',
  'Read staff inbox',
  ref('AdvisorInbox'),
  undefined,
  'ADVISOR or ADMIN',
);
op(
  '/advisor',
  'post',
  'advisorAction',
  'Note, suggest or resolve requests',
  ok,
  ref('AdvisorAction'),
  'ADVISOR or ADMIN',
);
for (const method of ['post', 'delete'])
  op(
    '/grants',
    method,
    method === 'post' ? 'grantPrivateAccess' : 'revokePrivateAccess',
    'Change client-specific private introduction',
    object({ granted: bool }),
    ref('Grant'),
    'ADVISOR or ADMIN',
  );
for (const [resource, schema] of [
  ['properties', 'Property'],
  ['developers', 'Developer'],
  ['communities', 'Community'],
  ['media', 'Media'],
  ['users', 'User'],
  ['audit', 'AuditEvent'],
  ['analytics', 'Analytics'],
]) {
  op(
    `/admin/${resource}`,
    'get',
    `adminList${schema}`,
    'Read admin-managed resource',
    resource === 'properties'
      ? ref('SearchResponse')
      : resource === 'analytics'
        ? ref(schema)
        : array(ref(schema)),
    undefined,
    'ADMIN',
  );
  if (['audit', 'analytics'].includes(resource)) continue;
  const input =
    resource === 'properties'
      ? ref('ListingInput')
      : resource === 'users'
        ? ref('UserInput')
        : (structuredClone(schemas[schema]) as Record<string, unknown>);
  if ('required' in input && resource !== 'communities')
    input.required = (input.required as string[]).filter((x) => x !== 'id');
  op(
    `/admin/${resource}`,
    'post',
    `adminSave${schema}`,
    'Create/update resource; id selects update',
    object({ id: str }),
    input,
    'ADMIN',
  );
  if (resource !== 'users')
    op(
      `/admin/${resource}`,
      'delete',
      `adminDelete${schema}`,
      'Delete unreferenced resource',
      object({ deleted: bool }),
      undefined,
      'ADMIN',
      [idQuery],
    );
}
const officeSchemas: Record<string, z.ZodType> = {
  Story: storyDTOSchema,
  StorySummary: storySummarySchema,
  Office: office.officeDTOSchema,
  Portfolio: office.portfolioDTOSchema,
  PortfolioCreate: office.portfolioCreateSchema,
  PortfolioRename: office.portfolioRenameSchema,
  PortfolioItems: office.portfolioItemsInputSchema,
  OfficeComparison: office.officeComparisonSchema,
  OfficeComparisonInput: office.comparisonInputSchema,
  OfficeViewing: office.viewingDTOSchema,
  OfficeViewingInput: office.viewingInputSchema,
  ProjectEnquiry: office.projectEnquirySchema,
  ProjectEnquiryInput: office.projectEnquiryInputSchema,
  AssignedAdvisor: office.advisorDTOSchema,
  AdvisorThread: office.threadDTOSchema,
  AdvisorMessageInput: office.threadMessageInputSchema,
  OfficePrivacy: office.officePrivacySchema,
  OfficePrivacyInput: office.privacySettingsInputSchema,
};
for (const [name, schema] of Object.entries(officeSchemas))
  schemas[name] = compactSchema(name, schema);
const officeRoles = 'CLIENT or VERIFIED_CLIENT';
const preferenceParams = [
  { in: 'query', name: 'locale', schema: { enum: ['en', 'ar'] } },
  { in: 'query', name: 'currency', schema: { enum: ['AED', 'EGP', 'USD', 'EUR', 'SAR', 'GBP'] } },
  { in: 'query', name: 'areaUnit', schema: { enum: ['sqm', 'sqft'] } },
  { in: 'query', name: 'arabicIndicDigits', schema: { type: 'string', enum: ['1', '0'] } },
];
op(
  '/stories/{slug}',
  'get',
  'getStory',
  'Fresh authorized editorial story; missing and denied are opaque',
  ref('Story'),
  undefined,
  'PUBLIC',
  [
    {
      in: 'path',
      name: 'slug',
      required: true,
      schema: { type: 'string', pattern: '^(project|unit)-[a-zA-Z0-9][a-zA-Z0-9-]{0,180}$' },
    },
    ...preferenceParams,
  ],
);
op(
  '/office',
  'get',
  'getOffice',
  'Owned boards, requests, current advisor and privacy policy',
  ref('Office'),
  undefined,
  officeRoles,
  preferenceParams,
);
op(
  '/office/entity',
  'get',
  'getOfficeEntity',
  'Resolve a draft intent without writing',
  ref('StorySummary'),
  undefined,
  officeRoles,
  [
    {
      in: 'query',
      name: 'kind',
      required: true,
      schema: { enum: ['reference-project', 'demo-unit'] },
    },
    idQuery,
    ...preferenceParams,
  ],
);
op(
  '/portfolios',
  'get',
  'listPortfolios',
  'List owned, freshly authorized mixed portfolios',
  array(ref('Portfolio')),
  undefined,
  officeRoles,
  preferenceParams,
);
op(
  '/portfolios',
  'post',
  'createPortfolio',
  'Create a named portfolio with an idempotency key',
  ref('Portfolio'),
  ref('PortfolioCreate'),
  officeRoles,
  [],
  'application/json',
  201,
);
op(
  '/portfolios/{id}',
  'get',
  'getPortfolio',
  'Read one owned portfolio; inaccessible entries are omitted',
  ref('Portfolio'),
  undefined,
  officeRoles,
  [idParam, ...preferenceParams],
);
op(
  '/portfolios/{id}',
  'patch',
  'renamePortfolio',
  'Rename using an expected version and idempotency key',
  ref('Portfolio'),
  ref('PortfolioRename'),
  officeRoles,
  [idParam],
);
op(
  '/portfolios/{id}',
  'delete',
  'deletePortfolio',
  'Delete an owned portfolio; permitted under privacy restrictions',
  object({ deleted: bool }),
  undefined,
  officeRoles,
  [idParam],
);
for (const method of ['post', 'delete'])
  op(
    '/portfolios/{id}/items',
    method,
    method === 'post' ? 'addPortfolioItems' : 'removePortfolioItems',
    method === 'post'
      ? 'Atomically add authorized typed interests'
      : 'Remove owned interests; permitted under privacy restrictions',
    ref('Portfolio'),
    ref('PortfolioItems'),
    officeRoles,
    [idParam],
  );
op(
  '/portfolios/{id}/dossier',
  'get',
  'downloadOfficeDossier',
  'Bilingual owner-only PDF; reauthorize before and after rendering; no new client content is persisted',
  { type: 'string', format: 'binary' },
  undefined,
  officeRoles,
  [
    idParam,
    ...preferenceParams.filter((p) => p.name !== 'arabicIndicDigits'),
    {
      in: 'query',
      name: 'arabicIndicDigits',
      schema: { type: 'string', enum: ['1', '0', 'true', 'false'] },
    },
    {
      in: 'query',
      name: 'reviewVisible',
      schema: { type: 'string', enum: ['true', 'false'] },
      description:
        'Explicitly export the currently visible set after a neutral portfolio_changed or dossier_review_required response. Does not grant access.',
    },
  ],
  'application/pdf',
);
op(
  '/office/comparison',
  'post',
  'compareOfficeEntities',
  'Compare two to four fresh authorized interests, preserving native currencies and price bases',
  ref('OfficeComparison'),
  ref('OfficeComparisonInput'),
  officeRoles,
  preferenceParams,
);
op(
  '/office/viewings',
  'get',
  'listOfficeViewings',
  'Read own requests with current unit authorization',
  array(ref('OfficeViewing')),
  undefined,
  officeRoles,
  preferenceParams,
);
op(
  '/office/viewings',
  'post',
  'requestOfficeViewing',
  'Request one authorized fictional unit; reject ambiguous/nonexistent local times',
  ref('OfficeViewing'),
  ref('OfficeViewingInput'),
  officeRoles,
  [],
  'application/json',
  201,
);
op(
  '/office/viewings/{id}',
  'delete',
  'cancelOfficeViewing',
  'Cancel an owned request under any privacy policy',
  object({ cancelled: bool }),
  undefined,
  officeRoles,
  [idParam],
);
op(
  '/project-enquiries',
  'get',
  'listProjectEnquiries',
  'Read own reference-project enquiries',
  array(ref('ProjectEnquiry')),
  undefined,
  officeRoles,
  preferenceParams,
);
op(
  '/project-enquiries',
  'post',
  'requestProjectEnquiry',
  'Persist an explicit reference enquiry in the assigned advisor thread; never create a unit viewing',
  ref('ProjectEnquiry'),
  ref('ProjectEnquiryInput'),
  officeRoles,
  [],
  'application/json',
  201,
);
op(
  '/project-enquiries/{id}',
  'delete',
  'cancelProjectEnquiry',
  'Cancel an owned reference enquiry',
  object({ cancelled: bool }),
  undefined,
  officeRoles,
  [idParam],
);
op(
  '/office/advisor',
  'get',
  'getAssignedAdvisor',
  'Current fictional demo advisor with authored availability, or null',
  { anyOf: [ref('AssignedAdvisor'), { type: 'null' }] },
  undefined,
  officeRoles,
);
op(
  '/office/advisor/availability',
  'patch',
  'setAdvisorAvailability',
  'Author own availability; does not assert live online presence',
  object({ updated: bool }),
  object({ availability: convert(office.advisorAvailabilitySchema) }),
  'ADVISOR',
);
op(
  '/office/threads/{id}/messages',
  'get',
  'readAssignedThread',
  'Read only as owning client or current assigned advisor; attachments use client visibility',
  ref('AdvisorThread'),
  undefined,
  officeRoles + ' or current assigned ADVISOR',
  [idParam, { in: 'query', name: 'cursor', schema: str }, ...preferenceParams],
);
op(
  '/office/threads/{id}/messages',
  'post',
  'sendAssignedMessage',
  'Explicit idempotent plain-text message; no automatic Brief/history copy',
  ref('AdvisorThread'),
  ref('AdvisorMessageInput'),
  officeRoles + ' or current assigned ADVISOR',
  [idParam],
  'application/json',
  201,
);
op(
  '/office/privacy',
  'get',
  'getOfficePrivacy',
  'Read durable minimal privacy policy',
  ref('OfficePrivacy'),
  undefined,
  officeRoles,
);
op(
  '/office/privacy',
  'patch',
  'replaceOfficePrivacy',
  'Explicit versioned policy settings; invalidates old proposals',
  ref('OfficePrivacy'),
  ref('OfficePrivacyInput'),
  officeRoles,
);
op(
  '/office/private-collection',
  'get',
  'getPrivateCollection',
  'Authorized collection only; no withheld count or preview',
  array(ref('StorySummary')),
  undefined,
  officeRoles,
  preferenceParams,
);

writeFileSync(
  'docs/openapi.json',
  JSON.stringify(
    {
      openapi: '3.1.0',
      info: {
        title: 'Darivo API',
        version: '1.0.0',
        description:
          'Bilingual sourced reference projects and fictional demo inventory. Session-cookie auth; current role, ownership, privacy and visibility checked server-side.',
      },
      servers: [{ url: '/api/v1' }],
      components: {
        securitySchemes: {
          SessionCookie: {
            type: 'apiKey',
            in: 'cookie',
            name: 'authjs.session-token',
            description: 'Auth.js JWT cookie; __Secure-authjs.session-token under HTTPS.',
          },
        },
        schemas,
      },
      paths,
    },
    null,
    2,
  ) + '\n',
);
console.info(`Generated ${Object.keys(paths).length} API paths.`);
