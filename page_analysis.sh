#!/bin/bash

echo "🔍 ANALYZING PROBLEMATIC PAGE COMPONENTS..."
echo "==========================================="

# Find the main culprits
echo "📁 FINDING PROBLEMATIC PAGES:"
echo "-----------------------------"

# Find contributor page component
CONTRIBUTOR_PAGE=$(find app -path "*/contributor/*" -name "page.*" | head -1)
echo "Contributor page: $CONTRIBUTOR_PAGE"

# Find mixtapes tag page component  
MIXTAPES_TAG_PAGE=$(find app -path "*/mixtapes/*" -name "page.*" | head -1)
echo "Mixtapes tag page: $MIXTAPES_TAG_PAGE"

# Find root page
ROOT_PAGE="app/page.js"
if [ ! -f "$ROOT_PAGE" ]; then
    ROOT_PAGE="app/page.tsx"
fi
echo "Root page: $ROOT_PAGE"

echo ""
echo "🔍 ANALYZING THESE COMPONENTS FOR ISSUES:"
echo "========================================="

analyze_component() {
    local file=$1
    local name=$2
    
    if [ ! -f "$file" ]; then
        echo "❌ $name not found at $file"
        return
    fi
    
    echo ""
    echo "📄 $name ($file):"
    echo "$(head -30 "$file")"
    echo "..."
    echo ""
    
    # Check for common SSG-breaking patterns
    echo "🔍 Checking for SSG-breaking patterns in $name:"
    
    # Check for client-side code during render
    client_code=$(grep -n "window\.\|document\.\|localStorage\|sessionStorage\|navigator\." "$file" | grep -v "useEffect\|typeof window\|typeof document" || true)
    if [ ! -z "$client_code" ]; then
        echo "⚠️  Found client-side code during render:"
        echo "$client_code"
    fi
    
    # Check for direct API calls during render
    api_calls=$(grep -n "fetch(\|axios\|swr\|useSWR" "$file" | grep -v "useEffect\|useState\|useMemo\|useCallback" || true)
    if [ ! -z "$api_calls" ]; then
        echo "⚠️  Found API calls during render:"
        echo "$api_calls"
    fi
    
    # Check for dynamic imports
    dynamic_imports=$(grep -n "import(\|next/dynamic" "$file" || true)
    if [ ! -z "$dynamic_imports" ]; then
        echo "ℹ️  Found dynamic imports:"
        echo "$dynamic_imports"
    fi
    
    # Check for useSearchParams or usePathname
    next_hooks=$(grep -n "useSearchParams\|usePathname\|useRouter" "$file" || true)
    if [ ! -z "$next_hooks" ]; then
        echo "⚠️  Found Next.js hooks that require client-side:"
        echo "$next_hooks"
    fi
    
    echo "----------------------------------------"
}

# Analyze each component
analyze_component "$CONTRIBUTOR_PAGE" "Contributor Page"
analyze_component "$MIXTAPES_TAG_PAGE" "Mixtapes Tag Page" 
analyze_component "$ROOT_PAGE" "Root Page"

echo ""
echo "🔍 SUMMARY OF ISSUES TO FIX:"
echo "============================"
echo "1. Fix API routes (run the bulk fix script)"
echo "2. Move client-side code to useEffect in page components"
echo "3. Wrap components using Next.js hooks with 'use client' directive"
echo "4. Consider if pages actually need static generation or should be dynamic"

echo ""
echo "🎯 NEXT STEPS:"
echo "=============="
echo "1. Run: chmod +x bulk_api_fix.sh && ./bulk_api_fix.sh"
echo "2. Review the page component analysis above"
echo "3. Apply fixes to the problematic page components"
echo "4. Re-run build to check progress"