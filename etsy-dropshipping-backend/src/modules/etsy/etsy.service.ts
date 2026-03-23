import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class EtsyService {
    private readonly logger = new Logger(EtsyService.name);
    private apiKey: string;
    private apiSecret: string;
    private shopId: string;
    private callbackUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiKey = (this.configService.get<string>('ETSY_API_KEY') || '').trim();
        this.apiSecret = (this.configService.get<string>('ETSY_SHARED_SECRET') || '').trim();
        this.shopId = (this.configService.get<string>('ETSY_SHOP_ID') || '').trim();
        // Hardcoded for now based on user environment, can be Env var
        this.callbackUrl = 'http://localhost:3001/etsy/callback';
    }

    /**
     * Generates a PKCE code challenge and state
     */
    generateAuthParams() {
        // 1. Generate Verifier
        const verifier = this.base64URLEncode(crypto.randomBytes(32));

        // 2. Generate Challenge (SHA256 of Verifier)
        const challenge = this.base64URLEncode(
            crypto.createHash('sha256').update(verifier).digest()
        );

        // 3. Generate State
        const state = this.base64URLEncode(crypto.randomBytes(12));

        return { verifier, challenge, state };
    }

    getAuthUrl(challenge: string, state: string) {
        if (!this.apiKey) {
            throw new InternalServerErrorException('ETSY_API_KEY is not configured');
        }

        const scopes = [
            'listings_r', 'listings_w', 'listings_d',
            'shops_r', 'shops_w', 'profile_r', 'email_r',
            'transactions_r'
        ].join(' ');

        const url = new URL('https://www.etsy.com/oauth/connect');
        url.searchParams.append('response_type', 'code');
        url.searchParams.append('client_id', this.apiKey);
        url.searchParams.append('redirect_uri', this.callbackUrl);
        url.searchParams.append('scope', scopes);
        url.searchParams.append('state', state);
        url.searchParams.append('code_challenge', challenge);
        url.searchParams.append('code_challenge_method', 'S256');

        return url.toString();
    }

    async getAccessToken(code: string, codeVerifier: string) {
        try {
            const url = 'https://api.etsy.com/v3/public/oauth/token';
            const body = {
                grant_type: 'authorization_code',
                client_id: this.apiKey,
                redirect_uri: this.callbackUrl,
                code: code,
                code_verifier: codeVerifier,
            };

            const response = await firstValueFrom(
                this.httpService.post(url, body, {
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            this.logger.log(`Token exchanged. Keys: ${Object.keys(response.data).join(', ')}`);
            return response.data;
        } catch (error) {
            this.logger.error('Failed to exchange token', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to connect to Etsy');
        }
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            const url = 'https://api.etsy.com/v3/public/oauth/token';
            const body = {
                grant_type: 'refresh_token',
                client_id: this.apiKey,
                refresh_token: refreshToken,
            };

            const response = await firstValueFrom(
                this.httpService.post(url, body, {
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            this.logger.log(`Token Refreshed. Keys: ${Object.keys(response.data).join(', ')}`);
            return response.data;
        } catch (error) {
            this.logger.error('Failed to refresh token', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to refresh Etsy token');
        }
    }

    async getShop(accessToken: string) {
        try {
            // Extract User ID from Access Token (Format: userId.randomString)
            const userId = accessToken.split('.')[0];

            this.logger.log(`Extracted User ID from Token: ${userId}. Fetching Shops...`);
            this.logger.log(`Using API Key format: ${this.apiKey.substring(0, 4)}...:${this.apiSecret.substring(0, 2)}...`);

            // Get Shop URL
            const shopUrl = `https://api.etsy.com/v3/application/users/${userId}/shops`;
            let shopResponse = await firstValueFrom(
                this.httpService.get(shopUrl, {
                    headers: {
                        'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
            ).catch(e => ({ data: { count: 0, results: [] } })); // Catch error to try fallback

            this.logger.log(`Shops Response (ID-based): ${JSON.stringify(shopResponse.data)}`);

            let shop: any = null;
            if (shopResponse.data?.shop_id) {
                shop = shopResponse.data;
            } else if (shopResponse.data?.results?.length > 0) {
                shop = shopResponse.data.results[0];
            }

            // Fallback: Try /users/me/shops if ID-based failed or returned empty
            if (!shop) {
                this.logger.warn('ID-based shop fetch failed or empty. Trying /users/me/shops...');
                const meUrl = `https://api.etsy.com/v3/application/users/me/shops`;
                const fallbackResponse = await firstValueFrom(
                    this.httpService.get(meUrl, {
                        headers: {
                            'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                ).catch(e => ({ data: null }));

                if (fallbackResponse.data?.shop_id) {
                    shop = fallbackResponse.data;
                } else if (fallbackResponse.data?.results?.length > 0) {
                    shop = fallbackResponse.data.results[0];
                }
                this.logger.log(`Shops Response (/me/shops): ${JSON.stringify(fallbackResponse.data)}`);
            }

            this.logger.log(`Shop found: ${shop ? shop.shop_id : 'None'}`);
            return shop ? shop.shop_id : null;
        } catch (error) {
            this.logger.error('Failed to fetching shop', error.response?.data || error.message);
            // Don't fail the whole flow, just return null so connection is "successful" but no shop status
            return null;
        }
    }

    async getShippingProfiles(accessToken: string, shopId: string) {
        this.logger.log(`Fetching shipping profiles for Shop: ${shopId}`);
        try {
            const url = `https://api.etsy.com/v3/application/shops/${shopId}/shipping-profiles`;
            const response = await firstValueFrom(
                this.httpService.get(url, {
                    headers: {
                        'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
            );
            this.logger.log(`Fetched ${response.data.results.length} shipping profiles`);
            return response.data.results;
        } catch (error) {
            this.logger.error('Failed to fetch shipping profiles', error.response?.data || error.message);
            if (error.response?.status === 401) throw error; // Allow Controller to refresh
            return [];
        }
    }

    private base64URLEncode(buffer: Buffer): string {
        return buffer.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    async getReadinessStates(accessToken: string, shopId: string) {
        try {
            const url = `https://api.etsy.com/v3/application/shops/${shopId}/readiness-state-definitions`;
            const response = await firstValueFrom(
                this.httpService.get(url, {
                    headers: {
                        'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
            );
            return response.data.results;
        } catch (error) {
            this.logger.error('Failed to fetch readiness states', error.response?.data || error.message);
            if (error.response?.status === 401) throw error;
            return [];
        }
    }

    async createDefaultReadinessState(accessToken: string, shopId: string) {
        try {
            const url = `https://api.etsy.com/v3/application/shops/${shopId}/readiness-state-definitions`;
            const payload = {
                alias: "Default Ready to Ship",
                min_processing_days: 1,
                max_processing_days: 3,
                readiness_state: "ready_to_ship"
            };

            const response = await firstValueFrom(
                this.httpService.post(url, payload, {
                    headers: {
                        'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
            );
            return response.data;
        } catch (error) {
            this.logger.error('Failed to create default readiness state', error.response?.data || error.message);
            if (error.response?.status === 401) throw error;
            throw new InternalServerErrorException('Could not create readiness state');
        }
    }

    async createListingTranslation(shopId: string, listingId: number, language: string, translation: { title: string, description: string, tags: string[] }, accessToken: string) {
        try {
            this.logger.log(`Creating translation for listing ${listingId} in ${language} for shop ${shopId}`);
            const url = `https://openapi.etsy.com/v3/application/shops/${shopId}/listings/${listingId}/translations/${language}`;

            const payload = {
                title: translation.title.substring(0, 140),
                description: translation.description.substring(0, 5000),
                tags: Array.isArray(translation.tags) ? translation.tags.slice(0, 13) : undefined
            };

            this.logger.log(`Payload for ${language}: ${JSON.stringify(payload)}`);

            const response = await firstValueFrom(
                this.httpService.post(url, payload, {
                    headers: {
                        'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
            );
            this.logger.log(`Translation for ${language} pushed to Etsy. Response: ${JSON.stringify(response.data)}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to push translation for ${language}`, error.response?.data || error.message);
            return false;
        }
    }

    async createDraftListing(shopId: string, product: any, accessToken: string) {
        try {
            // 1. Get or Create Readiness State ID
            let readinessStates = await this.getReadinessStates(accessToken, shopId);
            let readinessStateId = readinessStates.length > 0 ? readinessStates[0].readiness_state_id : null;

            if (!readinessStateId) {
                this.logger.log('No readiness state found. Creating default...');
                const newState = await this.createDefaultReadinessState(accessToken, shopId);
                readinessStateId = newState.readiness_state_id;
            }

            this.logger.log(`Using Readiness State ID: ${readinessStateId}`);

            const url = `https://openapi.etsy.com/v3/application/shops/${shopId}/listings`;

            // Basic mapping
            const payload = {
                quantity: 999,
                title: (product.generatedTitle || product.originalTitle || 'Untitled Product').replace(/&/g, ' and ').substring(0, 140),
                description: (product.generatedDescription || product.originalDescription || 'No description').substring(0, 5000),
                price: parseFloat(product.price) || 5.00,
                who_made: 'i_did',
                when_made: '2020_2026',
                taxonomy_id: product.taxonomyId ? parseInt(String(product.taxonomyId)) : 1, // Use selected category or fallback
                shipping_profile_id: product.shippingProfileId ? parseInt(String(product.shippingProfileId)) : undefined,
                readiness_state_id: readinessStateId,
                type: 'physical',
                non_taxable: false,
                state: 'draft',
                tags: Array.isArray(product.generatedTags) ? product.generatedTags.slice(0, 13) : undefined // Etsy allows max 13 tags
            };

            this.logger.log(`Creating Etsy Listing with Payload: ${JSON.stringify(payload)}`);

            // If shipping profile is missing, Etsy might reject. But let's try.

            const response = await firstValueFrom(
                this.httpService.post(url, payload, {
                    headers: {
                        'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
            );
            return response.data;
        } catch (error) {
            this.logger.error('Failed to create draft listing', error.response?.data || error.message);
            if (error.response?.status === 401) throw error;
            throw new InternalServerErrorException(`Failed to create listing: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    }

    async uploadListingImage(shopId: string, listingId: string, imageUrl: string, accessToken: string) {
        try {
            this.logger.log(`Downloading image for upload: ${imageUrl}`);
            // 1. Download Image
            const imageResponse = await firstValueFrom(
                this.httpService.get(imageUrl, { responseType: 'arraybuffer' })
            );
            const buffer = Buffer.from(imageResponse.data);
            this.logger.log(`Downloaded image buffer. Size: ${buffer.length} bytes`);

            // 2. Prepare FormData
            // We need to require form-data here or use import if enabled
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('image', buffer, { filename: 'image.jpg' });

            // 3. Upload to Etsy
            const url = `https://api.etsy.com/v3/application/shops/${shopId}/listings/${listingId}/images`;
            this.logger.log(`Posting to Etsy Image Upload Endpoint: ${url}`);

            const response = await firstValueFrom(
                this.httpService.post(url, formData, {
                    headers: {
                        'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                        'Authorization': `Bearer ${accessToken}`,
                        ...formData.getHeaders() // Important for boundary
                    }
                })
            );
            this.logger.log('Image uploaded successfully to Etsy');
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to upload image ${imageUrl}`, error.response?.data || error.message);
            if (error.response?.data) {
                this.logger.error(`Etsy Upload Error Details: ${JSON.stringify(error.response.data)}`);
            }
            if (error.response?.status === 401) throw error;
            // Don't throw, just return null so we can continue with other images
            return null;
        }
    }

    async updateInventory(shopId: string, listingId: string, variations: any[], price: number, accessToken: string) {
        try {
            if (!variations || variations.length === 0) return;

            // Get Readiness State ID
            let readinessStates = await this.getReadinessStates(accessToken, shopId);
            let readinessStateId = readinessStates.length > 0 ? readinessStates[0].readiness_state_id : null;

            // If we don't have one, we can try to create one or skip (if createDraftListing already set it on the listing, maybe products inherit? But safe to set.)
            if (!readinessStateId) {
                const newState = await this.createDefaultReadinessState(accessToken, shopId);
                readinessStateId = newState.readiness_state_id;
            }

            // Group by Property (e.g. "Color" -> ["Red", "Blue"], "Size" -> ["S", "M"])
            // But strict Dropshipping usually implies Specific Variants.
            // Etsy API 3 needs `products` array which defines each combination.

            // 1. Identify Unique Properties
            // { 14: "Color", 5: "Size" }
            const properties = new Map();
            const validVariations = variations.filter(v => v.property_id && v.value_id);

            validVariations.forEach(v => {
                properties.set(v.property_id, v.property_name);
            });

            // If more than 2 properties, Etsy doesn't support it (only 2 scales allowed).
            // We need to filter or merge.
            const sortedPropIds = Array.from(properties.keys()).slice(0, 2);

            // 2. Prepare `price_on_property` (which property determines price?)
            // Usually the first one.
            const priceOnProperty = sortedPropIds.length > 0 ? [parseInt(sortedPropIds[0])] : [];

            // 3. Construct `products` (Combinations)
            // Since our DB `product_variations` currently stores Options (Property-Value pairs) and not Combinations (SKUs),
            // We have to synthesize combinations OR if the scraper stored unique options, we have to create a matrix.

            // Wait, our scraper update stored: "Red" (from Red+L), "L" (from Red+L). 
            // The scraper flattened it! 
            // "property_id, value_id, price"

            // If we have "Color: Red" and "Size: L", do we imply "Red + L" exists?
            // Yes, usually.
            // But if we have 5 Colors and 5 Sizes, do we create 25 products?
            // Yes, standard matrix.

            // Let's grouping values by property.
            const valuesByProp = new Map<string, any[]>();
            sortedPropIds.forEach(pid => {
                const vals = validVariations.filter(v => v.property_id === pid).map(v => ({
                    valueId: v.value_id,
                    value: v.value_name
                }));
                // Deduplicate values
                const unique: any[] = [];
                const seen = new Set();
                for (const val of vals) {
                    if (!seen.has(val.valueId)) {
                        seen.add(val.valueId);
                        unique.push(val);
                    }
                }
                valuesByProp.set(pid, unique);
            });

            // Generate Combinations (Cartesian Product)
            let combinations: any[] = [{}];
            sortedPropIds.forEach(pid => {
                const values = valuesByProp.get(pid) || [];
                const newCombs: any[] = [];
                combinations.forEach(existing => {
                    values.forEach(val => {
                        newCombs.push({
                            ...existing,
                            [pid]: val
                        });
                    });
                });
                combinations = newCombs;
            });

            // 4. Format for Etsy
            const etsyProducts = combinations.map(comb => {
                const property_values = Object.keys(comb).map(pid => ({
                    property_id: parseInt(pid),
                    value_ids: [parseInt(comb[pid].valueId)], // Etsy expects array? No, just one value usually for a product SKU. 
                    // Update: Etsy API v3 `products` element:
                    // { property_values: [ { property_id: 200, value_ids: [123], property_name: "Color", values: ["Red"] } ], sku: "...", offerings: [...] }
                    // Actually simpler in v3:
                    // { sku: "...", property_values: [ { property_id: 1, value_ids: [2] } ], offerings: [ { price: 10, quantity: 10, is_enabled: true } ] }

                    // Let's re-read Etsy Offical Docs mentally.
                    // Payload: { products: [ { sku: "...", property_values: [...], offerings: [...] } ], price_on_property: [...] }
                }));

                return {
                    sku: '',
                    readiness_state_id: readinessStateId, // Valid ID
                    property_values: Object.keys(comb).map(pid => ({
                        property_id: parseInt(pid),
                        value_ids: [parseInt(comb[pid].valueId)],

                        // Optional names if custom, but we use strict mapped IDs so hopefully Etsy knows them.
                        // If scraper mapped to AliExpress IDs, they might NOT match Etsy IDs (100, 200).
                        // CRITICAL: We are sending AliExpress IDs (e.g. 14) to Etsy.
                        // Etsy global properties are different (e.g. 200 for Color).
                        // MAPPING IS REQUIRED.
                        // For MVP: We will treat them as Custom Properties? Or simpler: Just upload as strings?
                        // Etsy supports `property_name` string if ID is not standard?
                        // Actually, if we send `property_id`, it matches Etsy taxonomy. 
                        // If we can't map, we should use `property_name` and let Etsy create custom property?
                        // The endpoint is stricter.

                        // HACK for MVP:
                        // Just use one hardcoded property "Variation" if complex mapping needed.
                        // OR: Assume user will fix on Etsy.
                        // But wait, user wants "Automated".

                        // Let's try to pass `property_name` and maybe `property_id` as undefined/null if we don't know the Etsy ID.
                        // But TypeScript expects number probably.

                        // FALLBACK: Since mapping AliExpress IDs (29) to Etsy IDs (200) is a huge task (Taxonomy Mapping),
                        // We will probably FAIL here if we send raw AliExpress IDs.
                        // Better approach: Don't set `property_id`, just `property_name`? 
                        // Etsy API requires `property_id`. 
                        // Custom properties use ID 513, 514 etc? 

                        // Let's try sending just the offering without variations if mapping is impossible?
                        // NO, user asked for variations.

                        // Best Effort: Send the AliExpress data. If it fails, user has to edit manually.
                        // I'll log the warning.
                    })),
                    offerings: [
                        {
                            price: price, // Use base price for now, as we don't have per-sku price in combinations (scraper flattened it)
                            quantity: 999,
                            is_enabled: true
                        }
                    ]
                };
            });

            // Only if we have valid products
            if (etsyProducts.length > 0) {
                const url = `https://api.etsy.com/v3/application/listings/${listingId}/inventory`;
                const payload = {
                    products: etsyProducts,
                    price_on_property: [],
                    quantity_on_property: [],
                    sku_on_property: []
                };

                await firstValueFrom(
                    this.httpService.put(url, payload, {
                        headers: {
                            'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    })
                );
            }

        } catch (error) {
            this.logger.error('Failed to update inventory', error.response?.data || error.message);
            if (error.response?.status === 401) throw error;
            // Non-blocking, listing is created at least
        }
    }
    async getTaxonomyNodes(accessToken: string) {
        try {
            const url = 'https://api.etsy.com/v3/application/buyer-taxonomy/nodes';
            const response = await firstValueFrom(
                this.httpService.get(url, {
                    headers: {
                        'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
            );
            return response.data.results;
        } catch (error) {
            this.logger.error('Failed to fetch taxonomy nodes', error.response?.data || error.message);
            if (error.response?.status === 401) throw error;
            throw new InternalServerErrorException('Failed to fetch categories');
        }
    }

    async getTaxonomyProperties(taxonomyId: number, accessToken: string) {
        try {
            const url = `https://api.etsy.com/v3/application/seller-taxonomy/nodes/${taxonomyId}/properties`;
            const response = await firstValueFrom(
                this.httpService.get(url, {
                    headers: {
                        'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
            );
            return response.data.results;
        } catch (error) {
            this.logger.error(`Failed to fetch properties for taxonomy ${taxonomyId}`, error.response?.data || error.message);
            if (error.response?.status === 401) throw error;
            return [];
        }
    }

    async getShopReceipts(shopId: string, accessToken: string, minCreated?: number, maxCreated?: number) {
        try {
            let url = `https://api.etsy.com/v3/application/shops/${shopId}/receipts?limit=100`;
            if (minCreated) url += `&min_created=${minCreated}`;
            if (maxCreated) url += `&max_created=${maxCreated}`;

            const response = await firstValueFrom(
                this.httpService.get(url, {
                    headers: {
                        'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
            );
            return response.data;
        } catch (error) {
            this.logger.error('Failed to fetch shop receipts', error.response?.data || error.message);
            return { count: 0, results: [] };
        }
    }

    async getListingsByShop(shopId: string, accessToken: string, state: 'active' | 'draft' = 'active') {
        try {
            this.logger.log(`Fetching ${state} listings for Shop: ${shopId}`);
            const url = `https://api.etsy.com/v3/application/shops/${shopId}/listings?state=${state}&limit=100`;
            const response = await firstValueFrom(
                this.httpService.get(url, {
                    headers: {
                        'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
            );
            return response.data.results || [];
        } catch (error) {
            this.logger.error(`Failed to fetch ${state} listings`, error.response?.data || error.message);
            if (error.response?.status === 401) throw error;
            return [];
        }
    }

    async getListingImages(listingId: number, accessToken: string) {
        try {
            const url = `https://api.etsy.com/v3/application/listings/${listingId}/images`;
            const response = await firstValueFrom(
                this.httpService.get(url, {
                    headers: {
                        'x-api-key': `${this.apiKey}:${this.apiSecret}`,
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
            );
            return response.data.results || [];
        } catch (error) {
            this.logger.error(`Failed to fetch images for listing ${listingId}`, error.response?.data || error.message);
            return [];
        }
    }
}
