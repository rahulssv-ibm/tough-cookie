import { toASCII } from "punycode";

declare const OpaqueTagSymbol: unique symbol;
    
declare class OpaqueTag<S extends symbol> {
    private [OpaqueTagSymbol]: S
}

export type Opaque<T, S extends symbol> = T & OpaqueTag<S>

declare const HostNameTag: unique symbol
type HostName = Opaque<string, typeof HostNameTag>

declare const CanonicalizedHostName: unique symbol
export type CanonicalizedHostName = Opaque<string, typeof CanonicalizedHostName>

/**
 * A canonicalized host name is the string generated by the following algorithm:
 */
export function parseCanonicalizedHostName(hostName: HostName): CanonicalizedHostName {
    return hostName
        // #section-5.1.2-2.1
        // 1. Convert the host name to a sequence of individual domain name labels.
        .split('.')
        // #section-5.1.2-2.2
        // 2. Convert each label that is not a Non-Reserved LDH (NR-LDH) label, to an A-label 
        // (see Section 2.3.2.1 of [RFC5890] for the former and latter), or to a "punycode 
        // label" (a label resulting from the "ToASCII" conversion in Section 4 of [RFC3490]), 
        // as appropriate (see Section 6.3 of this specification).
        .map(value => {
            if (isULabel(value)) {
                return toALabel(value)
            }
        
            if (isLDHLabel(value)) {
                if (isALabel(value)) {
                    return value
                } else {
                    return value as NRLDHLabel
                }
            }
        })
        // #section-5.1.2-2.3
        // 3. Concatenate the resulting labels, separated by a %x2E (".") character.
        .join('.')
        .toLowerCase() as CanonicalizedHostName
}

// https://datatracker.ietf.org/doc/html/rfc5890#section-2.3.1
declare const ALabelTag: unique symbol
type ALabel = Opaque<string, typeof ALabelTag>

declare const ULabelTag: unique symbol
type ULabel = Opaque<string, typeof ULabelTag>

declare const NRLDHLabelTag: unique symbol
type NRLDHLabel = Opaque<string, typeof NRLDHLabelTag>

declare const LDHLabelTag: unique symbol
type LDHLabel = Opaque<string, typeof NRLDHLabelTag>

function isULabel(value: string): value is ULabel {
    return /[^\u0001-\u007f]/.test(value)
}

function isLDHLabel(value: string): value is LDHLabel {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]$/.test(value)
}

function isALabel(value: string): value is ALabel {
    return /^xn--/.test(value)
}

function toALabel(value: ULabel): ALabel {
    return toASCII(value) as ALabel
}