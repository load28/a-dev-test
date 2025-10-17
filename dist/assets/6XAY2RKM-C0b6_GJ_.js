import{o as q,g as $e,d as Te,e as M,f as Le,h as F,i as E,k as u,l as Be,m as ae,t as y,n as h,p as D,q as k,s as v,v as $,w as Q,x as Ue,y as K,z as G,A as le,P as Ye,B as _,S as ee,T as se,C as Ne,F as W,D as je,E as Re,H as We,I as pe,J as qe,K as fe,L as Ke}from"./index-BY1DOLLK.js";function Se(t){var e,l,i="";if(typeof t=="string"||typeof t=="number")i+=t;else if(typeof t=="object")if(Array.isArray(t)){var c=t.length;for(e=0;e<c;e++)t[e]&&(l=Se(t[e]))&&(i&&(i+=" "),i+=l)}else for(l in t)t[l]&&(i&&(i+=" "),i+=l);return i}function B(){for(var t,e,l=0,i="",c=arguments.length;l<c;l++)(t=arguments[l])&&(e=Se(t))&&(i&&(i+=" "),i+=e);return i}let Ge={data:""},Ve=t=>{if(typeof window=="object"){let e=(t?t.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return e.nonce=window.__nonce__,e.parentNode||(t||document.head).appendChild(e),e.firstChild}return t||Ge},Ze=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,Je=/\/\*[^]*?\*\/|  +/g,ve=/\n+/g,O=(t,e)=>{let l="",i="",c="";for(let s in t){let r=t[s];s[0]=="@"?s[1]=="i"?l=s+" "+r+";":i+=s[1]=="f"?O(r,s):s+"{"+O(r,s[1]=="k"?"":e)+"}":typeof r=="object"?i+=O(r,e?e.replace(/([^,])+/g,a=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,o=>/&/.test(o)?o.replace(/&/g,a):a?a+" "+o:o)):s):r!=null&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),c+=O.p?O.p(s,r):s+":"+r+";")}return l+(e&&c?e+"{"+c+"}":c)+i},P={},ze=t=>{if(typeof t=="object"){let e="";for(let l in t)e+=l+ze(t[l]);return e}return t},Xe=(t,e,l,i,c)=>{let s=ze(t),r=P[s]||(P[s]=(o=>{let n=0,d=11;for(;n<o.length;)d=101*d+o.charCodeAt(n++)>>>0;return"go"+d})(s));if(!P[r]){let o=s!==t?t:(n=>{let d,g,f=[{}];for(;d=Ze.exec(n.replace(Je,""));)d[4]?f.shift():d[3]?(g=d[3].replace(ve," ").trim(),f.unshift(f[0][g]=f[0][g]||{})):f[0][d[1]]=d[2].replace(ve," ").trim();return f[0]})(t);P[r]=O(c?{["@keyframes "+r]:o}:o,l?"":"."+r)}let a=l&&P.g?P.g:null;return l&&(P.g=P[r]),((o,n,d,g)=>{g?n.data=n.data.replace(g,o):n.data.indexOf(o)===-1&&(n.data=d?o+n.data:n.data+o)})(P[r],e,i,a),r},_e=(t,e,l)=>t.reduce((i,c,s)=>{let r=e[s];if(r&&r.call){let a=r(l),o=a&&a.props&&a.props.className||/^go/.test(a)&&a;r=o?"."+o:a&&typeof a=="object"?a.props?"":O(a,""):a===!1?"":a}return i+c+(r??"")},"");function te(t){let e=this||{},l=t.call?t(e.p):t;return Xe(l.unshift?l.raw?_e(l,[].slice.call(arguments,1),e.p):l.reduce((i,c)=>Object.assign(i,c&&c.call?c(e.p):c),{}):l,Ve(e.target),e.g,e.o,e.k)}te.bind({g:1});te.bind({k:1});const X=(t,e)=>t===e||t.length===e.length&&t.every((l,i)=>l===e[i]),et=q;function U(t,e,l,i){return t.addEventListener(e,l,i),et(t.removeEventListener.bind(t,e,l,i))}function ce(t,e=$e()){let l=0,i,c;return()=>(l++,q(()=>{l--,queueMicrotask(()=>{!l&&c&&(c(),c=i=void 0)})}),c||Te(s=>i=t(c=s),e),i)}function me(t,e){for(let l=t.length-1;l>=0;l--){const i=e.slice(0,l+1);if(!X(t[l],i))return!1}return!0}const Me=ce(()=>{const[t,e]=E(null);return U(window,"keydown",l=>{e(l),setTimeout(()=>e(null))}),t}),tt=ce(()=>{const[t,e]=E([]),l=()=>e([]),i=Me();return U(window,"keydown",c=>{if(c.repeat||typeof c.key!="string")return;const s=c.key.toUpperCase(),r=t();if(r.includes(s))return;const a=[...r,s];r.length===0&&s!=="ALT"&&s!=="CONTROL"&&s!=="META"&&s!=="SHIFT"&&(c.shiftKey&&a.unshift("SHIFT"),c.altKey&&a.unshift("ALT"),c.ctrlKey&&a.unshift("CONTROL"),c.metaKey&&a.unshift("META")),e(a)}),U(window,"keyup",c=>{if(typeof c.key!="string")return;const s=c.key.toUpperCase();e(r=>r.filter(a=>a!==s))}),U(window,"blur",l),U(window,"contextmenu",c=>{c.defaultPrevented||l()}),t[0]=t,t[1]={event:i},t[Symbol.iterator]=function*(){yield t[0],yield t[1]},t}),rt=ce(()=>{const t=tt();return F(e=>t().length===0?[]:[...e,t()],[])});function ot(t,e,l={}){if(!t.length)return;t=t.map(n=>n.toUpperCase());const{preventDefault:i=!0}=l,c=Me(),s=rt();let r=!1;const a=n=>{if(!n.length)return r=!1;if(r)return;const d=c();n.length<t.length?me(n,t.slice(0,n.length))?i&&d&&d.preventDefault():r=!0:(r=!0,me(n,t)&&(i&&d&&d.preventDefault(),e(d)))},o=n=>{const d=n.at(-1);if(!d)return;const g=c();if(i&&d.length<t.length){X(d,t.slice(0,t.length-1))&&g&&g.preventDefault();return}if(X(d,t)){const f=n.at(-2);(!f||X(f,t.slice(0,t.length-1)))&&(i&&g&&g.preventDefault(),e(g))}};M(Le(s,l.requireReset?a:o))}const Fe=Be(void 0),nt=t=>{const[e,l]=E(t.theme);return M(()=>{l(t.theme)}),u(Fe.Provider,{value:{theme:e,setTheme:l},get children(){return t.children}})};function it(){const t=ae(Fe);if(!t)throw new Error("useTheme must be used within a ThemeContextProvider");return t}const b={colors:{inherit:"inherit",current:"currentColor",transparent:"transparent",black:"#000000",white:"#ffffff",neutral:{50:"#f9fafb",100:"#f2f4f7",200:"#eaecf0",300:"#d0d5dd",400:"#98a2b3",500:"#667085",600:"#475467",700:"#344054",800:"#1d2939",900:"#101828"},darkGray:{50:"#525c7a",100:"#49536e",200:"#414962",300:"#394056",400:"#313749",500:"#292e3d",600:"#212530",700:"#191c24",800:"#111318",900:"#0b0d10"},gray:{50:"#f9fafb",100:"#f2f4f7",200:"#eaecf0",300:"#d0d5dd",400:"#98a2b3",500:"#667085",600:"#475467",700:"#344054",800:"#1d2939",900:"#101828"},blue:{25:"#F5FAFF",50:"#EFF8FF",100:"#D1E9FF",200:"#B2DDFF",300:"#84CAFF",400:"#53B1FD",500:"#2E90FA",600:"#1570EF",700:"#175CD3",800:"#1849A9",900:"#194185"},green:{25:"#F6FEF9",50:"#ECFDF3",100:"#D1FADF",200:"#A6F4C5",300:"#6CE9A6",400:"#32D583",500:"#12B76A",600:"#039855",700:"#027A48",800:"#05603A",900:"#054F31"},red:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"},yellow:{25:"#FFFCF5",50:"#FFFAEB",100:"#FEF0C7",200:"#FEDF89",300:"#FEC84B",400:"#FDB022",500:"#F79009",600:"#DC6803",700:"#B54708",800:"#93370D",900:"#7A2E0E"},purple:{25:"#FAFAFF",50:"#F4F3FF",100:"#EBE9FE",200:"#D9D6FE",300:"#BDB4FE",400:"#9B8AFB",500:"#7A5AF8",600:"#6938EF",700:"#5925DC",800:"#4A1FB8",900:"#3E1C96"},teal:{25:"#F6FEFC",50:"#F0FDF9",100:"#CCFBEF",200:"#99F6E0",300:"#5FE9D0",400:"#2ED3B7",500:"#15B79E",600:"#0E9384",700:"#107569",800:"#125D56",900:"#134E48"},pink:{25:"#fdf2f8",50:"#fce7f3",100:"#fbcfe8",200:"#f9a8d4",300:"#f472b6",400:"#ec4899",500:"#db2777",600:"#be185d",700:"#9d174d",800:"#831843",900:"#500724"},cyan:{25:"#ecfeff",50:"#cffafe",100:"#a5f3fc",200:"#67e8f9",300:"#22d3ee",400:"#06b6d4",500:"#0891b2",600:"#0e7490",700:"#155e75",800:"#164e63",900:"#083344"}},font:{size:{xs:"calc(var(--tsrd-font-size) * 0.75)",sm:"calc(var(--tsrd-font-size) * 0.875)",md:"var(--tsrd-font-size)"},lineHeight:{xs:"calc(var(--tsrd-font-size) * 1)"},weight:{medium:"500",semibold:"600",bold:"700"},fontFamily:{sans:"ui-sans-serif, Inter, system-ui, sans-serif, sans-serif",mono:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"}},border:{radius:{xs:"calc(var(--tsrd-font-size) * 0.125)",sm:"calc(var(--tsrd-font-size) * 0.25)",full:"9999px"}},size:{.5:"calc(var(--tsrd-font-size) * 0.125)",1:"calc(var(--tsrd-font-size) * 0.25)",1.5:"calc(var(--tsrd-font-size) * 0.375)",2:"calc(var(--tsrd-font-size) * 0.5)",2.5:"calc(var(--tsrd-font-size) * 0.625)",3:"calc(var(--tsrd-font-size) * 0.75)",4.5:"calc(var(--tsrd-font-size) * 1.125)",6.5:"calc(var(--tsrd-font-size) * 1.625)",12:"calc(var(--tsrd-font-size) * 3)"}},at={primary:{bg:b.colors.gray[900],hover:b.colors.gray[800],active:b.colors.gray[700],text:"#fff",border:b.colors.gray[900]},secondary:{bg:b.colors.gray[100],hover:b.colors.gray[200],active:b.colors.gray[300],text:b.colors.gray[900],border:b.colors.gray[300]},info:{bg:b.colors.blue[500],hover:b.colors.blue[600],active:b.colors.blue[700],text:"#fff",border:b.colors.blue[500]},warning:{bg:b.colors.yellow[500],hover:b.colors.yellow[600],active:b.colors.yellow[700],text:"#fff",border:b.colors.yellow[500]},danger:{bg:b.colors.red[500],hover:b.colors.red[600],active:b.colors.red[700],text:"#fff",border:b.colors.red[500]},success:{bg:b.colors.green[500],hover:b.colors.green[600],active:b.colors.green[700],text:"#fff",border:b.colors.green[500]}},p=te,be=(t="dark")=>{const{colors:e,font:l,size:i,border:c}=b,{fontFamily:s}=l,r=(o,n)=>t==="light"?o:n,a=320;return{logo:p`
      cursor: pointer;
      display: flex;
      flex-direction: column;
      background-color: transparent;
      border: none;
      width: ${i[12]};
      height: ${i[12]};
      font-family: ${s.sans};
      gap: ${b.size[.5]};
      padding: 0px;
      &:hover {
        opacity: 0.7;
      }
    `,selectWrapper:p`
      width: 100%;
      max-width: ${a}px;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    `,selectContainer:p`
      width: 100%;
    `,selectLabel:p`
      font-size: 0.875rem;
      font-weight: 500;
      color: ${r(e.gray[900],e.gray[100])};
      text-align: left;
    `,selectDescription:p`
      font-size: 0.8rem;
      color: ${r(e.gray[500],e.gray[400])};
      margin: 0;
      line-height: 1.3;
      text-align: left;
    `,select:p`
      appearance: none;
      width: 100%;
      padding: 0.5rem 3rem 0.5rem 0.75rem;
      border-radius: 0.375rem;
      background-color: ${r(e.gray[50],e.darkGray[800])};
      color: ${r(e.gray[900],e.gray[100])};
      border: 1px solid ${r(e.gray[200],e.gray[800])};
      font-size: 0.875rem;
      transition: all 0.15s ease;
      cursor: pointer;

      /* Custom arrow */
      background-image: url("data:image/svg+xml;utf8,<svg fill='%236b7280' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 1.25rem;

      &:hover {
        border-color: ${r(e.gray[300],e.gray[700])};
      }

      &:focus {
        outline: none;
        border-color: ${e.gray[400]};
        box-shadow: 0 0 0 3px ${r(e.gray[200],e.gray[800])};
      }
    `,inputWrapper:p`
      width: 100%;
      max-width: ${a}px;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    `,inputContainer:p`
      width: 100%;
    `,inputLabel:p`
      font-size: 0.875rem;
      font-weight: 500;
      color: ${r(e.gray[900],e.gray[100])};
      text-align: left;
    `,inputDescription:p`
      font-size: 0.8rem;
      color: ${r(e.gray[500],e.gray[400])};
      margin: 0;
      line-height: 1.3;
      text-align: left;
    `,input:p`
      appearance: none;
      box-sizing: border-box;
      width: 100%;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      background-color: ${r(e.gray[50],e.darkGray[800])};
      color: ${r(e.gray[900],e.gray[100])};
      border: 1px solid ${r(e.gray[200],e.gray[800])};
      font-size: 0.875rem;
      font-family: ${s.mono};
      transition: all 0.15s ease;

      &::placeholder {
        color: ${r(e.gray[400],e.gray[500])};
      }

      &:hover {
        border-color: ${r(e.gray[300],e.gray[700])};
      }

      &:focus {
        outline: none;
        border-color: ${r(e.gray[400],e.gray[600])};
        box-shadow: 0 0 0 3px ${r(e.gray[200],e.gray[800])};
      }
    `,checkboxWrapper:p`
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      cursor: pointer;
      user-select: none;
      padding: 0.375rem;
      border-radius: 0.375rem;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: ${r(e.gray[50],e.darkGray[900])};
      }
    `,checkboxContainer:p`
      width: 100%;
    `,checkboxLabelContainer:p`
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
    `,checkbox:p`
      appearance: none;
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid ${r(e.gray[300],e.gray[700])};
      border-radius: 0.25rem;
      background-color: ${r(e.gray[50],e.darkGray[800])};
      display: grid;
      place-items: center;
      transition: all 0.15s ease;
      flex-shrink: 0;
      margin-top: 0.125rem;

      &:hover {
        border-color: ${r(e.gray[400],e.gray[600])};
      }

      &:checked {
        background-color: ${r(e.gray[900],e.gray[100])};
        border-color: ${r(e.gray[900],e.gray[100])};
      }

      &:checked::after {
        content: '';
        width: 0.4rem;
        height: 0.6rem;
        border: solid ${r("#fff",e.gray[900])};
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
        margin-top: -3px;
      }
    `,checkboxLabel:p`
      color: ${r(e.gray[900],e.gray[100])};
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.4;
      text-align: left;
    `,checkboxDescription:p`
      color: ${r(e.gray[500],e.gray[400])};
      font-size: 0.8rem;
      line-height: 1.3;
      text-align: left;
    `,button:{base:p`
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: ${b.font.fontFamily.sans};
        font-size: 0.8rem;
        font-weight: 500;
        border-radius: 0.375rem;
        padding: 0.375rem 0.75rem;
        cursor: pointer;
        transition:
          background 0.15s,
          color 0.15s,
          border 0.15s,
          box-shadow 0.15s;
        outline: none;
        border-width: 1px;
        border-style: solid;
      `,variant(o,n,d){const g=at[o];return d?p`
            background: transparent;
            color: ${r(g.bg,g.bg)};
            border-color: transparent;
            &:hover {
              background: ${r(e.gray[100],e.darkGray[800])};
            }
            &:active {
              background: ${r(e.gray[200],e.darkGray[700])};
            }
          `:n?p`
            background: transparent;
            color: ${r(g.bg,g.bg)};
            border-color: ${r(g.bg,g.bg)};
            &:hover {
              background: ${r(e.gray[50],e.darkGray[800])};
              border-color: ${r(g.hover,g.hover)};
            }
            &:active {
              background: ${r(e.gray[100],e.darkGray[700])};
              border-color: ${r(g.active,g.active)};
            }
          `:p`
          background: ${r(g.bg,g.bg)};
          color: ${r(g.text,g.text)};
          border-color: ${r(g.border,g.border)};
          &:hover {
            background: ${r(g.hover,g.hover)};
            border-color: ${r(g.hover,g.hover)};
          }
          &:active {
            background: ${r(g.active,g.active)};
            border-color: ${r(g.active,g.active)};
          }
        `}},tag:{dot:o=>p`
        width: ${b.size[1.5]};
        height: ${b.size[1.5]};
        border-radius: ${b.border.radius.full};
        background-color: ${r(b.colors[o][500],b.colors[o][500])};
      `,base:p`
        display: flex;
        gap: ${b.size[1.5]};
        box-sizing: border-box;
        height: ${b.size[6.5]};
        background: ${r(e.gray[50],e.darkGray[500])};
        color: ${r(e.gray[700],e.gray[300])};
        border-radius: ${b.border.radius.sm};
        font-size: ${l.size.sm};
        padding: ${b.size[1]};
        padding-left: ${b.size[1.5]};
        align-items: center;
        font-weight: ${l.weight.medium};
        border: ${r("1px solid "+e.gray[300],"1px solid transparent")};
        user-select: none;
        position: relative;
        &:focus-visible {
          outline-offset: 2px;
          outline: 2px solid ${r(e.blue[700],e.blue[800])};
        }
      `,label:p`
        font-size: ${l.size.xs};
      `,count:p`
        font-size: ${l.size.xs};
        padding: 0 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${r(e.gray[500],e.gray[400])};
        background-color: ${r(e.gray[200],e.darkGray[300])};
        border-radius: 2px;
        font-variant-numeric: tabular-nums;
        height: ${b.size[4.5]};
      `},tree:{info:p`
        color: ${r(e.gray[500],e.gray[500])};
        font-size: ${l.size.xs};
        margin-right: ${i[1]};
      `,actionButton:p`
        background-color: transparent;
        color: ${r(e.gray[500],e.gray[500])};
        border: none;
        display: inline-flex;
        padding: 0px;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        width: ${i[3]};
        height: ${i[3]};
        position: relative;
        z-index: 1;

        &:hover svg {
          color: ${r(e.gray[600],e.gray[400])};
        }

        &:focus-visible {
          border-radius: ${c.radius.xs};
          outline: 2px solid ${r(e.blue[700],e.blue[800])};
          outline-offset: 2px;
        }
      `,expanderContainer:p`
        position: relative;
      `,expander:p`
        position: absolute;
        cursor: pointer;
        left: -16px;
        top: 3px;
        & path {
          stroke: ${r(e.blue[400],e.blue[300])};
        }
        & svg {
          width: ${i[3]};
          height: ${i[3]};
        }

        display: inline-flex;
        align-items: center;
        transition: all 0.1s ease;
      `,expandedLine:o=>p`
        display: block;
        padding-left: 0.75rem;
        margin-left: -0.7rem;
        ${o?`border-left: 1px solid ${r(e.blue[400],e.blue[300])};`:""}
      `,collapsible:p`
        cursor: pointer;
        transition: all 0.2s ease;
        &:hover {
          background-color: ${r(e.gray[100],e.darkGray[700])};
          border-radius: ${b.border.radius.sm};
          padding: 0 ${b.size[1]};
        }
      `,actions:p`
        display: inline-flex;
        margin-left: ${i[2]};
        gap: ${i[2]};
        align-items: center;
        & svg {
          height: 12px;
          width: 12px;
        }
      `,valueCollapsed:p`
        color: ${r(e.gray[500],e.gray[400])};
      `,valueFunction:p`
        color: ${r(e.cyan[500],e.cyan[400])};
      `,valueString:p`
        color: ${r(e.green[500],e.green[400])};
      `,valueNumber:p`
        color: ${r(e.yellow[500],e.yellow[400])};
      `,valueBoolean:p`
        color: ${r(e.pink[500],e.pink[400])};
      `,valueNull:p`
        color: ${r(e.gray[500],e.gray[400])};
        font-style: italic;
      `,valueKey:p`
        color: ${r(e.blue[400],e.blue[300])};
      `,valueBraces:p`
        color: ${e.gray[500]};
      `,valueContainer:o=>p`
        display: block;
        margin-left: ${o?"0":"1rem"};

        &:not(:hover) .actions {
          display: none;
        }

        &:hover .actions {
          display: inline-flex;
        }
      `},header:{row:p`
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: ${b.size[2]} ${b.size[2.5]};
        gap: ${b.size[2.5]};
        border-bottom: ${r(e.gray[300],e.darkGray[500])} 1px solid;
        align-items: center;
      `,logoAndToggleContainer:p`
        display: flex;
        gap: ${b.size[3]};
        align-items: center;
        & > button {
          padding: 0;
          background: transparent;
          border: none;
          display: flex;
          gap: ${i[.5]};
          flex-direction: column;
        }
      `,logo:p`
        cursor: pointer;
        display: flex;
        flex-direction: column;
        background-color: transparent;
        border: none;
        gap: ${b.size[.5]};
        padding: 0px;
        &:hover {
          opacity: 0.7;
        }
        &:focus-visible {
          outline-offset: 4px;
          border-radius: ${c.radius.xs};
          outline: 2px solid ${e.blue[800]};
        }
      `,tanstackLogo:p`
        font-size: ${l.size.md};
        font-weight: ${l.weight.bold};
        line-height: ${l.lineHeight.xs};
        white-space: nowrap;
        color: ${r(e.gray[700],e.gray[300])};
      `,flavorLogo:(o,n)=>p`
        font-weight: ${l.weight.semibold};
        font-size: ${l.size.xs};
        background: linear-gradient(to right, ${r(o,n)});
        background-clip: text;
        -webkit-background-clip: text;
        line-height: 1;
        -webkit-text-fill-color: transparent;
        white-space: nowrap;
      `},section:{main:p`
        margin-bottom: 1.5rem;
        padding: 1rem;
        background-color: ${r(e.gray[50],e.darkGray[800])};
        border: 1px solid ${r(e.gray[200],e.gray[800])};
        border-radius: 0.5rem;
        box-shadow: none;
      `,title:p`
        font-size: 1rem;
        font-weight: 600;
        color: ${r(e.gray[900],e.gray[100])};
        margin: 0 0 0.75rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid ${r(e.gray[200],e.gray[800])};
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-align: left;
      `,icon:p`
        height: 18px;
        width: 18px;
        & > svg {
          height: 100%;
          width: 100%;
        }
        color: ${r(e.gray[700],e.gray[400])};
      `,description:p`
        color: ${r(e.gray[500],e.gray[400])};
        font-size: 0.8rem;
        margin: 0 0 1rem 0;
        line-height: 1.4;
        text-align: left;
      `},mainPanel:{panel:o=>p`
        padding: ${o?b.size[3]:0};
        background: ${r(e.gray[50],e.darkGray[700])};
        overflow-y: auto;
        height: 100%;
      `}}};function H(){const{theme:t}=it(),[e,l]=E(be(t()));return M(()=>{l(be(t()))}),e}var lt=y("<div><label><input type=checkbox><div>"),ye=y("<span>");function Z(t){const e=H(),[l,i]=E(t.checked||!1),c=s=>{const r=s.target.checked;i(r),t.onChange?.(r)};return(()=>{var s=lt(),r=s.firstChild,a=r.firstChild,o=a.nextSibling;return a.$$input=c,h(o,(()=>{var n=D(()=>!!t.label);return()=>n()&&(()=>{var d=ye();return h(d,()=>t.label),k(()=>v(d,e().checkboxLabel)),d})()})(),null),h(o,(()=>{var n=D(()=>!!t.description);return()=>n()&&(()=>{var d=ye();return h(d,()=>t.description),k(()=>v(d,e().checkboxDescription)),d})()})(),null),k(n=>{var d=e().checkboxContainer,g=e().checkboxWrapper,f=e().checkbox,x=e().checkboxLabelContainer;return d!==n.e&&v(s,n.e=d),g!==n.t&&v(r,n.t=g),f!==n.a&&v(a,n.a=f),x!==n.o&&v(o,n.o=x),n},{e:void 0,t:void 0,a:void 0,o:void 0}),k(()=>a.checked=l()),s})()}$(["input"]);var st=y("<div><div><input>"),ct=y("<label>"),dt=y("<p>");function oe(t){const e=H(),[l,i]=E(t.value||""),c=s=>{const r=s.target.value;i(a=>a!==r?r:a),t.onChange?.(r)};return(()=>{var s=st(),r=s.firstChild,a=r.firstChild;return h(r,(()=>{var o=D(()=>!!t.label);return()=>o()&&(()=>{var n=ct();return h(n,()=>t.label),k(()=>v(n,e().inputLabel)),n})()})(),a),h(r,(()=>{var o=D(()=>!!t.description);return()=>o()&&(()=>{var n=dt();return h(n,()=>t.description),k(()=>v(n,e().inputDescription)),n})()})(),a),a.$$input=c,k(o=>{var n=e().inputContainer,d=e().inputWrapper,g=t.type||"text",f=e().input,x=t.placeholder;return n!==o.e&&v(s,o.e=n),d!==o.t&&v(r,o.t=d),g!==o.a&&Q(a,"type",o.a=g),f!==o.o&&v(a,o.o=f),x!==o.i&&Q(a,"placeholder",o.i=x),o},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0}),k(()=>a.value=l()),s})()}$(["input"]);var gt=y("<div><div><select>"),ut=y("<label>"),ht=y("<p>"),pt=y("<option>");function ne(t){const e=H(),[l,i]=E(t.value||t.options[0]?.value),c=s=>{const r=s.target.value;i(a=>a!==r?r:a),t.onChange?.(r)};return(()=>{var s=gt(),r=s.firstChild,a=r.firstChild;return h(r,(()=>{var o=D(()=>!!t.label);return()=>o()&&(()=>{var n=ut();return h(n,()=>t.label),k(()=>v(n,e().selectLabel)),n})()})(),a),h(r,(()=>{var o=D(()=>!!t.description);return()=>o()&&(()=>{var n=ht();return h(n,()=>t.description),k(()=>v(n,e().selectDescription)),n})()})(),a),a.$$input=c,h(a,()=>t.options.map(o=>(()=>{var n=pt();return h(n,()=>o.label),k(()=>n.value=o.value),n})())),k(o=>{var n=e().selectContainer,d=e().selectWrapper,g=e().select;return n!==o.e&&v(s,o.e=n),d!==o.t&&v(r,o.t=d),g!==o.a&&v(a,o.a=g),o},{e:void 0,t:void 0,a:void 0}),k(()=>a.value=l()),s})()}$(["input"]);var ft=y('<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="M8 6h10"></path><path d="M6 12h9"></path><path d="M11 18h7">'),vt=y('<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-file-search2-icon lucide-file-search-2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><circle cx=11.5 cy=14.5 r=2.5></circle><path d="M13.3 16.3 15 18">'),mt=y('<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 2v2"></path><path d="M12 22v-2"></path><path d="m17 20.66-1-1.73"></path><path d="M11 10.27 7 3.34"></path><path d="m20.66 17-1.73-1"></path><path d="m3.34 7 1.73 1"></path><path d="M14 12h8"></path><path d="M2 12h2"></path><path d="m20.66 7-1.73 1"></path><path d="m3.34 17 1.73-1"></path><path d="m17 3.34-1 1.73"></path><path d="m11 13.73-4 6.93">'),De=y('<svg xmlns=http://www.w3.org/2000/svg width=20 height=20 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="m10 9-3 3 3 3"></path><path d="m14 15 3-3-3-3"></path><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719">'),bt=y('<svg xmlns=http://www.w3.org/2000/svg width=20 height=20 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="M10 8h.01"></path><path d="M12 12h.01"></path><path d="M14 8h.01"></path><path d="M16 12h.01"></path><path d="M18 8h.01"></path><path d="M6 8h.01"></path><path d="M7 16h10"></path><path d="M8 12h.01"></path><rect width=20 height=16 x=2 y=4 rx=2>'),yt=y('<svg xmlns=http://www.w3.org/2000/svg width=20 height=20 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx=12 cy=10 r=3>'),wt=y('<svg xmlns=http://www.w3.org/2000/svg width=20 height=20 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="M9 17H7A5 5 0 0 1 7 7h2"></path><path d="M15 7h2a5 5 0 1 1 0 10h-2"></path><line x1=8 x2=16 y1=12 y2=12>'),xt=y('<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="M18 6 6 18"></path><path d="m6 6 12 12">'),kt=y('<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="M2 10h6V4"></path><path d="m2 4 6 6"></path><path d="M21 10V7a2 2 0 0 0-2-2h-7"></path><path d="M3 14v2a2 2 0 0 0 2 2h3"></path><rect x=12 y=14 width=10 height=7 rx=1>');function Ct(){return ft()}function At(){return vt()}function Et(){return mt()}function Bt(){return De()}function St(){return bt()}function zt(){return yt()}function Mt(){return De()}function Ft(){return wt()}function Dt(){return xt()}function Pt(){return kt()}var Ht=y("<button>");function J(t){const e=H(),[l,i]=Ue(t,["variant","outline","ghost","children","className"]),c=l.variant||"primary",s=B(e().button.base,e().button.variant(c,l.outline,l.ghost),l.className);return(()=>{var r=Ht();return K(r,G(i,{class:s}),!1),h(r,()=>l.children),r})()}var It=y("<div>");const Pe=({className:t,children:e,class:l,withPadding:i})=>{const c=H();return(()=>{var s=It();return h(s,e),k(()=>v(s,B(c().mainPanel.panel(!!i),t,l))),s})()};var Qt=y("<section>"),Ot=y("<h3>"),$t=y("<p>"),Tt=y("<span>");const Y=({children:t,...e})=>{const l=H();return(()=>{var i=Qt();return K(i,G({get class(){return B(l().section.main,e.class)}},e),!1),h(i,t),i})()},N=({children:t,...e})=>{const l=H();return(()=>{var i=Ot();return K(i,G({get class(){return B(l().section.title,e.class)}},e),!1),h(i,t),i})()},j=({children:t,...e})=>{const l=H();return(()=>{var i=$t();return K(i,G({get class(){return B(l().section.description,e.class)}},e),!1),h(i,t),i})()},R=({children:t,...e})=>{const l=H();return(()=>{var i=Tt();return K(i,G({get class(){return B(l().section.icon,e.class)}},e),!1),h(i,t),i})()};var Lt=t=>{const[e,l]=E(!1),[i,c]=E(!1),s=F(()=>e()||i());let r=null;return q(()=>{r&&clearTimeout(r)}),{expanded:s,setForceExpand:c,hoverUtils:{enter:()=>{r&&(clearTimeout(r),r=null),l(!0)},leave:()=>{r=setTimeout(()=>{l(!1)},t.animationMs)}},animationMs:t.animationMs}},He=Be(void 0),Ut=t=>{const e=Lt({animationMs:t.animationMs});return u(He.Provider,{value:e,get children(){return t.children}})};function de(){const t=ae(He);if(t===void 0)throw new Error("useDrawContext must be used within a DrawClientProvider");return t}var ge=()=>{const t=ae(je);if(t===void 0)throw new Error("useDevtoolsShellContext must be used within a ShellContextProvider");return t};function ue(){const{settings:t,setSettings:e}=T();return{theme:F(()=>t().theme),setTheme:i=>e({theme:i})}}var Yt=()=>{const{store:t,setStore:e}=ge(),{setForceExpand:l}=de(),i=F(()=>t.plugins),c=F(()=>t.state.activePlugins);return M(()=>{c().length===0?l(!0):l(!1)}),{plugins:i,toggleActivePlugins:r=>{e(a=>{const n=a.state.activePlugins.includes(r)?a.state.activePlugins.filter(d=>d!==r):[...a.state.activePlugins,r];return n.length>3?a:{...a,state:{...a.state,activePlugins:n}}})},activePlugins:c}},re=()=>{const{store:t,setStore:e}=ge();return{state:F(()=>t.state),setState:c=>{e(s=>({...s,state:{...s.state,...c}}))}}},T=()=>{const{store:t,setStore:e}=ge(),l=F(()=>t.settings);return{setSettings:c=>{e(s=>({...s,settings:{...s.settings,...c}}))},settings:l}},Nt=()=>{const{state:t,setState:e}=re();return{persistOpen:F(()=>t().persistOpen),setPersistOpen:c=>{e({persistOpen:c})}}},Ie=()=>{const{state:t,setState:e}=re();return{height:F(()=>t().height),setHeight:c=>{e({height:c})}}},Qe=(t,e=!0)=>{e?t.setAttribute("tabIndex","-1"):t.removeAttribute("tabIndex");for(const l of t.children)Qe(l,e)},jt=t=>{M(()=>{const e=document.getElementById(se);e&&Qe(e,!t())})},Rt={colors:{black:"#000000",white:"#ffffff",darkGray:{700:"#191c24",800:"#111318",900:"#0b0d10"},gray:{50:"#f9fafb",100:"#f2f4f7",200:"#eaecf0",300:"#d0d5dd",400:"#98a2b3",500:"#667085",600:"#475467",700:"#344054",800:"#1d2939",900:"#101828"},green:{500:"#12B76A",700:"#027A48"},red:{100:"#fee2e2",400:"#f87171",500:"#ef4444",700:"#b91c1c"},purple:{200:"#D9D6FE",800:"#4A1FB8"}},font:{size:{xs:"calc(var(--tsrd-font-size) * 0.75)",sm:"calc(var(--tsrd-font-size) * 0.875)"},fontFamily:{sans:"ui-sans-serif, Inter, system-ui, sans-serif, sans-serif"}},border:{radius:{full:"9999px"}},size:{2:"calc(var(--tsrd-font-size) * 0.5)",10:"calc(var(--tsrd-font-size) * 2.5)",48:"calc(var(--tsrd-font-size) * 12)"}},we=t=>`${(t/1e3).toFixed(2)}s`,xe=t=>{const{colors:e,font:l,size:i,border:c}=Rt,{fontFamily:s,size:r}=l,a=te,o=(n,d)=>t==="light"?n:d;return{seoTabContainer:a`
      padding: 0;
      margin: 0 auto;
      background: ${o(e.white,e.darkGray[700])};
      border-radius: 8px;
      box-shadow: none;
      overflow-y: auto;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 0;
      width: 100%;
      overflow-y: auto;
    `,seoTabTitle:a`
      font-size: 1.25rem;
      font-weight: 600;
      color: ${o(e.gray[900],e.gray[100])};
      margin: 0;
      padding: 1rem 1.5rem 0.5rem 1.5rem;
      text-align: left;
      border-bottom: 1px solid ${o(e.gray[200],e.gray[800])};
    `,seoTabSection:a`
      padding: 1.5rem;
      background: ${o(e.gray[50],e.darkGray[800])};
      border: 1px solid ${o(e.gray[200],e.gray[800])};
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 2rem;
      border-radius: 0.75rem;
    `,seoPreviewSection:a`
      display: flex;
      flex-direction: row;
      gap: 16px;
      margin-bottom: 0;
      justify-content: flex-start;
      align-items: flex-start;
      overflow-x: auto;
      flex-wrap: wrap;
      padding-bottom: 0.5rem;
    `,seoPreviewCard:a`
      border: 1px solid ${o(e.gray[200],e.gray[800])};
      border-radius: 8px;
      padding: 12px 10px;
      background: ${o(e.white,e.darkGray[900])};
      margin-bottom: 0;
      box-shadow: 0 1px 3px ${o("rgba(0,0,0,0.05)","rgba(0,0,0,0.1)")};
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 200px;
      max-width: 240px;
      font-size: 0.95rem;
      gap: 4px;
    `,seoPreviewHeader:a`
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0;
      color: ${o(e.gray[700],e.gray[300])};
    `,seoPreviewImage:a`
      max-width: 100%;
      border-radius: 6px;
      margin-bottom: 6px;
      box-shadow: 0 1px 2px ${o("rgba(0,0,0,0.03)","rgba(0,0,0,0.06)")};
      height: 160px;
      object-fit: cover;
    `,seoPreviewTitle:a`
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 4px;
      color: ${o(e.gray[900],e.gray[100])};
    `,seoPreviewDesc:a`
      color: ${o(e.gray[600],e.gray[400])};
      margin-bottom: 4px;
      font-size: 0.8rem;
    `,seoPreviewUrl:a`
      color: ${o(e.gray[500],e.gray[500])};
      font-size: 0.75rem;
      margin-bottom: 0;
      word-break: break-all;
    `,seoMissingTagsSection:a`
      margin-top: 4px;
      font-size: 0.875rem;
      color: ${o(e.red[500],e.red[400])};
    `,seoMissingTagsList:a`
      margin: 4px 0 0 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      max-width: 240px;
    `,seoMissingTag:a`
      background: ${o(e.red[100],e.red[500]+"22")};
      color: ${o(e.red[700],e.red[500])};
      border-radius: 3px;
      padding: 2px 6px;
      font-size: 0.75rem;
      font-weight: 500;
    `,seoAllTagsFound:a`
      color: ${o(e.green[700],e.green[500])};
      font-weight: 500;
      margin-left: 0;
      padding: 0 10px 8px 10px;
      font-size: 0.875rem;
    `,devtoolsPanelContainer:(n,d)=>a`
      direction: ltr;
      position: fixed;
      overflow-y: hidden;
      overflow-x: hidden;
      ${n}: 0;
      right: 0;
      z-index: 99999;
      width: 100%;
      ${d?"":"max-height: 90%;"}
      border-top: 1px solid ${o(e.gray[200],e.gray[800])};
      transform-origin: top;
    `,devtoolsPanelContainerVisibility:n=>a`
        visibility: ${n?"visible":"hidden"};
        height: ${n?"auto":"0"};
      `,devtoolsPanelContainerResizing:n=>n()?a`
          transition: none;
        `:a`
        transition: all 0.4s ease;
      `,devtoolsPanelContainerAnimation:(n,d,g)=>n?a`
          pointer-events: auto;
          transform: translateY(0);
        `:a`
        pointer-events: none;
        transform: translateY(${g==="top"?-d:d}px);
      `,devtoolsPanel:a`
      display: flex;
      font-size: ${r.sm};
      font-family: ${s.sans};
      background-color: ${o(e.white,e.darkGray[700])};
      color: ${o(e.gray[900],e.gray[300])};
      width: w-screen;
      flex-direction: row;
      overflow-x: hidden;
      overflow-y: hidden;
      height: 100%;
    `,dragHandle:n=>a`
      position: absolute;
      left: 0;
      ${n==="bottom"?"top":"bottom"}: 0;
      width: 100%;
      height: 4px;
      cursor: row-resize;
      user-select: none;
      z-index: 100000;
      &:hover {
        background-color: ${o(e.gray[400],e.gray[500])};
      }
    `,mainCloseBtn:a`
      background: transparent;
      position: fixed;
      z-index: 99999;
      display: inline-flex;
      width: fit-content;
      cursor: pointer;
      appearance: none;
      border: 0;
      align-items: center;
      padding: 0;
      font-size: ${l.size.xs};
      cursor: pointer;
      transition: all 0.25s ease-out;
      & > img {
        width: 56px;
        height: 56px;
        transition: all 0.3s ease;
        outline-offset: 2px;
        border-radius: ${c.radius.full};
        outline: 2px solid transparent;
      }
      &:hide-until-hover {
        opacity: 0;
        pointer-events: none;
        visibility: hidden;
      }
      &:hide-until-hover:hover {
        opacity: 1;
        pointer-events: auto;
        visibility: visible;
      }
      & > img:focus-visible,
      img:hover {
        outline: 2px solid ${o(e.black,e.black)};
      }
    `,mainCloseBtnPosition:n=>a`
        ${n==="top-left"?`top: ${i[2]}; left: ${i[2]};`:""}
        ${n==="top-right"?`top: ${i[2]}; right: ${i[2]};`:""}
        ${n==="middle-left"?`top: 50%; left: ${i[2]}; transform: translateY(-50%);`:""}
        ${n==="middle-right"?`top: 50%; right: ${i[2]}; transform: translateY(-50%);`:""}
        ${n==="bottom-left"?`bottom: ${i[2]}; left: ${i[2]};`:""}
        ${n==="bottom-right"?`bottom: ${i[2]}; right: ${i[2]};`:""}
      `,mainCloseBtnAnimation:(n,d)=>n?a`
        opacity: 0;
        pointer-events: none;
        visibility: hidden;
      `:d?a`
              opacity: 0;

              &:hover {
                opacity: 1;
                pointer-events: auto;
                visibility: visible;
              }
            `:a`
              opacity: 1;
              pointer-events: auto;
              visibility: visible;
            `,tabContainer:a`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      height: 100%;
      background-color: ${o(e.gray[50],e.darkGray[900])};
      border-right: 1px solid ${o(e.gray[200],e.gray[800])};
      box-shadow: none;
      position: relative;
      width: ${i[10]};
    `,tab:a`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: ${i[10]};
      cursor: pointer;
      font-size: ${r.sm};
      font-family: ${s.sans};
      color: ${o(e.gray[600],e.gray[400])};
      background-color: transparent;
      border: none;
      transition: all 0.15s ease;
      border-left: 2px solid transparent;
      &:hover:not(.close):not(.active):not(.detach) {
        background-color: ${o(e.gray[100],e.gray[800])};
        color: ${o(e.gray[900],e.gray[100])};
        border-left: 2px solid ${o(e.gray[900],e.gray[100])};
      }
      &.active {
        background-color: ${o(e.gray[100],e.gray[800])};
        color: ${o(e.gray[900],e.gray[100])};
        border-left: 2px solid ${o(e.gray[900],e.gray[100])};
      }
      &.detach {
        &:hover {
          background-color: ${o(e.gray[100],e.gray[800])};
        }
        &:hover {
          color: ${o(e.green[700],e.green[500])};
        }
      }
      &.close {
        margin-top: auto;
        &:hover {
          background-color: ${o(e.gray[100],e.gray[800])};
        }
        &:hover {
          color: ${o(e.red[700],e.red[500])};
        }
      }
      &.disabled {
        cursor: not-allowed;
        opacity: 0.2;
        pointer-events: none;
      }
      &.disabled:hover {
        background-color: transparent;
        color: ${e.gray[300]};
      }
    `,tabContent:a`
      transition: all 0.2s ease-in-out;
      width: 100%;
      height: 100%;
    `,pluginsTabPanel:a`
      display: flex;
      flex-direction: row;
      width: 100%;
      height: 100%;
      overflow: hidden;
    `,pluginsTabDraw:n=>a`
      width: ${n?i[48]:0};
      height: 100%;
      background-color: ${o(e.white,e.darkGray[900])};
      box-shadow: none;
      ${n?`border-right: 1px solid ${o(e.gray[200],e.gray[800])};`:""}
    `,pluginsTabDrawExpanded:a`
      width: ${i[48]};
      border-right: 1px solid ${o(e.gray[200],e.gray[800])};
    `,pluginsTabDrawTransition:n=>a`
        transition: width ${we(n)} ease;
      `,pluginsTabSidebar:n=>a`
      width: ${i[48]};
      overflow-y: auto;
      transform: ${n?"translateX(0)":"translateX(-100%)"};
    `,pluginsTabSidebarTransition:n=>a`
        transition: transform ${we(n)} ease;
      `,pluginName:a`
      font-size: ${r.xs};
      font-family: ${s.sans};
      color: ${o(e.gray[600],e.gray[400])};
      padding: ${i[2]};
      cursor: pointer;
      text-align: center;
      transition: all 0.15s ease;
      border-left: 2px solid transparent;

      &:hover {
        background-color: ${o(e.gray[100],e.gray[800])};
        color: ${o(e.gray[900],e.gray[100])};
        padding: ${i[2]};
      }
      &.active {
        background-color: ${o(e.gray[100],e.gray[800])};
        color: ${o(e.gray[900],e.gray[100])};
        border-left: 2px solid ${o(e.gray[900],e.gray[100])};
      }
      &.active:hover {
        background-color: ${o(e.gray[200],e.gray[700])};
      }
    `,pluginsTabContent:a`
      width: 100%;
      height: 100%;
      overflow-y: auto;

      &:not(:last-child) {
        border-right: 5px solid ${o(e.purple[200],e.purple[800])};
      }
    `,settingsGroup:a`
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    `,conditionalSetting:a`
      margin-left: 1.5rem;
      padding-left: 1rem;
      border-left: 2px solid ${o(e.gray[300],e.gray[600])};
      background-color: ${o(e.gray[50],e.darkGray[900])};
      padding: 0.75rem;
      border-radius: 0.375rem;
      margin-top: 0.5rem;
    `,settingRow:a`
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    `,settingsModifiers:a`
      display: flex;
      gap: 0.5rem;
    `}};function I(){const{theme:t}=ue(),[e,l]=E(xe(t()));return M(()=>{l(xe(t()))}),e}var ke="data:image/png;base64,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",Wt=y('<button type=button aria-label="Open TanStack Devtools"><img alt="TanStack Devtools">'),qt=({isOpen:t,setIsOpen:e,image:l=ke})=>{const{settings:i}=T(),c=I(),s=F(()=>B(c().mainCloseBtn,c().mainCloseBtnPosition(i().position),c().mainCloseBtnAnimation(t(),i().hideUntilHover)));return u(ee,{get when(){return!i().triggerHidden},get children(){var r=Wt(),a=r.firstChild;return r.$$click=()=>e(!t()),Q(a,"src",l||ke),k(()=>v(r,s())),r}})};$(["click"]);var Kt=y("<div>"),Gt=t=>{const e=I(),{height:l}=Ie(),{settings:i}=T(),c=le();return(()=>{var s=Kt();return Q(s,"id",se),h(s,u(Ut,{animationMs:400,get children(){return t.children}})),k(r=>{var a=c().pipWindow?"100vh":l()+"px",o=B(e().devtoolsPanelContainer(i().panelLocation,!!c().pipWindow),e().devtoolsPanelContainerAnimation(t.isOpen(),l(),i().panelLocation),e().devtoolsPanelContainerVisibility(t.isOpen()),e().devtoolsPanelContainerResizing(t.isResizing));return a!==r.e&&((r.e=a)!=null?s.style.setProperty("height",a):s.style.removeProperty("height")),o!==r.t&&v(s,r.t=o),r},{e:void 0,t:void 0}),s})()},Ce=y("<div>"),Vt=t=>{const e=I(),{settings:l}=T();return(()=>{var i=Ce(),c=t.ref;return typeof c=="function"?_(c,i):t.ref=i,h(i,(()=>{var s=D(()=>!!t.handleDragStart);return()=>s()?(()=>{var r=Ce();return Ne(r,"mousedown",t.handleDragStart,!0),k(()=>v(r,e().dragHandle(l().panelLocation))),r})():null})(),null),h(i,()=>t.children,null),k(()=>v(i,e().devtoolsPanel)),i})()};$(["mousedown"]);var ie=y("<div>"),Zt=y("<div><div></div>Final shortcut is: "),Jt=y("<div><div>"),Xt=()=>{const{setSettings:t,settings:e}=T(),l=I(),i=F(()=>e().openHotkey),c=["Control","Alt","Meta","Shift"],s=r=>()=>{if(i().includes(r))return t({openHotkey:i().filter(n=>n!==r)});const a=i().filter(n=>c.includes(n)),o=i().filter(n=>!c.includes(n));t({openHotkey:[...a,r,...o]})};return u(Pe,{withPadding:!0,get children(){return[u(Y,{get children(){return[u(N,{get children(){return[u(R,{get children(){return u(Bt,{})}}),"General"]}}),u(j,{children:"Configure general behavior of the devtools panel."}),(()=>{var r=ie();return h(r,u(Z,{label:"Default open",description:"Automatically open the devtools panel when the page loads",onChange:()=>t({defaultOpen:!e().defaultOpen}),get checked(){return e().defaultOpen}}),null),h(r,u(Z,{label:"Hide trigger until hovered",description:"Keep the devtools trigger button hidden until you hover over its area",onChange:()=>t({hideUntilHover:!e().hideUntilHover}),get checked(){return e().hideUntilHover}}),null),h(r,u(Z,{label:"Completely hide trigger",description:"Completely removes the trigger from the DOM (you can still open it with the hotkey)",onChange:()=>t({triggerHidden:!e().triggerHidden}),get checked(){return e().triggerHidden}}),null),h(r,u(oe,{label:"Trigger Image",description:"Specify the URL of the image to use for the trigger",get value(){return e().triggerImage},placeholder:"Default TanStack Logo",onChange:a=>t({triggerImage:a})}),null),h(r,u(ne,{label:"Theme",description:"Choose the theme for the devtools panel",get value(){return e().theme},options:[{label:"Dark",value:"dark"},{label:"Light",value:"light"}],onChange:a=>t({theme:a})}),null),k(()=>v(r,l().settingsGroup)),r})()]}}),u(Y,{get children(){return[u(N,{get children(){return[u(R,{get children(){return u(Ft,{})}}),"URL Configuration"]}}),u(j,{children:"Control when devtools are available based on URL parameters."}),(()=>{var r=ie();return h(r,u(Z,{label:"Require URL Flag",description:"Only show devtools when a specific URL parameter is present",get checked(){return e().requireUrlFlag},onChange:a=>t({requireUrlFlag:a})}),null),h(r,u(ee,{get when(){return e().requireUrlFlag},get children(){var a=ie();return h(a,u(oe,{label:"URL flag",description:"Enter the URL parameter name (e.g., 'debug' for ?debug=true)",placeholder:"debug",get value(){return e().urlFlag},onChange:o=>t({urlFlag:o})})),k(()=>v(a,l().conditionalSetting)),a}}),null),k(()=>v(r,l().settingsGroup)),r})()]}}),u(Y,{get children(){return[u(N,{get children(){return[u(R,{get children(){return u(St,{})}}),"Keyboard"]}}),u(j,{children:"Customize keyboard shortcuts for quick access."}),(()=>{var r=Zt(),a=r.firstChild,o=a.nextSibling;return h(a,u(ee,{keyed:!0,get when(){return i()},get children(){return[u(J,{variant:"success",get onclick(){return s("Shift")},get outline(){return!i().includes("Shift")},children:"Shift"}),u(J,{variant:"success",get onclick(){return s("Alt")},get outline(){return!i().includes("Alt")},children:"Alt"}),u(J,{variant:"success",get onclick(){return s("Meta")},get outline(){return!i().includes("Meta")},children:"Meta"}),u(J,{variant:"success",get onclick(){return s("Control")},get outline(){return!i().includes("Control")},children:"Control"})]}})),h(r,u(oe,{label:"Hotkey to open/close devtools",description:"Use '+' to combine keys (e.g., 'a+b' or 'd'). This will be used with the enabled modifiers from above",placeholder:"a",get value(){return i().filter(n=>!["Shift","Meta","Alt","Ctrl"].includes(n)).join("+")},onChange:n=>{const d=f=>{if(f.length===1)return[pe(f)];const x=[];for(const C of f){const m=pe(C);x.includes(m)||x.push(m)}return x},g=n.split("+").flatMap(f=>d(f)).filter(Boolean);return t({openHotkey:[...i().filter(f=>["Shift","Meta","Alt","Ctrl"].includes(f)),...g]})}}),o),h(r,()=>i().join(" + "),null),k(n=>{var d=l().settingsGroup,g=l().settingsModifiers;return d!==n.e&&v(r,n.e=d),g!==n.t&&v(a,n.t=g),n},{e:void 0,t:void 0}),r})()]}}),u(Y,{get children(){return[u(N,{get children(){return[u(R,{get children(){return u(zt,{})}}),"Position"]}}),u(j,{children:"Adjust the position of the trigger button and devtools panel."}),(()=>{var r=Jt(),a=r.firstChild;return h(a,u(ne,{label:"Trigger Position",options:[{label:"Bottom Right",value:"bottom-right"},{label:"Bottom Left",value:"bottom-left"},{label:"Top Right",value:"top-right"},{label:"Top Left",value:"top-left"},{label:"Middle Right",value:"middle-right"},{label:"Middle Left",value:"middle-left"}],get value(){return e().position},onChange:o=>t({position:o})}),null),h(a,u(ne,{label:"Panel Position",get value(){return e().panelLocation},options:[{label:"Top",value:"top"},{label:"Bottom",value:"bottom"}],onChange:o=>t({panelLocation:o})}),null),k(o=>{var n=l().settingsGroup,d=l().settingRow;return n!==o.e&&v(r,o.e=n),d!==o.t&&v(a,o.t=d),o},{e:void 0,t:void 0}),r})()]}})]}})},_t=y("<div><div><div>"),er=y("<div><h3>"),tr=y("<div>"),rr=()=>{const{plugins:t,activePlugins:e,toggleActivePlugins:l}=Yt(),{expanded:i,hoverUtils:c,animationMs:s}=de(),[r,a]=E(new Map),o=I(),{theme:n}=ue();return M(()=>{t()?.filter(g=>e().includes(g.id))?.forEach(g=>{const f=r().get(g.id);f&&g.render(f,n())})}),(()=>{var d=_t(),g=d.firstChild,f=g.firstChild;return g.addEventListener("mouseleave",()=>c.leave()),g.addEventListener("mouseenter",()=>c.enter()),h(f,u(W,{get each(){return t()},children:x=>{let C;M(()=>{C&&(typeof x.name=="string"?C.textContent=x.name:x.name(C,n()))});const m=F(()=>e().includes(x.id));return(()=>{var w=er(),A=w.firstChild;w.$$click=()=>{l(x.id)};var S=C;return typeof S=="function"?_(S,A):C=A,k(z=>{var V=B(o().pluginName,{active:m()}),L=`${Re}-${x.id}`;return V!==z.e&&v(w,z.e=V),L!==z.t&&Q(A,"id",z.t=L),z},{e:void 0,t:void 0}),w})()}})),h(d,u(W,{get each(){return e()},children:x=>(()=>{var C=tr();return _(m=>{a(w=>{const A=new Map(w);return A.set(x,m),A})},C),Q(C,"id",`${We}-${x}`),k(()=>v(C,o().pluginsTabContent)),C})()}),null),k(x=>{var C=o().pluginsTabPanel,m=B(o().pluginsTabDraw(i()),{[o().pluginsTabDraw(i())]:i()},o().pluginsTabDrawTransition(s)),w=B(o().pluginsTabSidebar(i()),o().pluginsTabSidebarTransition(s));return C!==x.e&&v(d,x.e=C),m!==x.t&&v(g,x.t=m),w!==x.a&&v(f,x.a=w),x},{e:void 0,t:void 0,a:void 0}),d})()};$(["click"]);function or(t,e={}){const{attributes:l=!0,childList:i=!0,subtree:c=!0,observeTitle:s=!0}=e;qe(()=>{const r=new MutationObserver(o=>{for(const n of o)if(n.type==="childList")n.addedNodes.forEach(d=>t({kind:"added",node:d},n)),n.removedNodes.forEach(d=>t({kind:"removed",node:d},n));else if(n.type==="attributes"){const d=n.target;t({kind:"attr",target:d,name:n.attributeName,oldValue:n.oldValue??null},n)}else n.target.parentNode&&n.target.parentNode.tagName.toLowerCase()==="title"&&t({kind:"title",title:document.title},n)});r.observe(document.head,{childList:i,attributes:l,subtree:c,attributeOldValue:l,characterData:!0,characterDataOldValue:!1});let a;if(s){const o=document.head.querySelector("title")||document.head.appendChild(document.createElement("title"));a=new MutationObserver(()=>{t({kind:"title",title:document.title})}),a.observe(o,{childList:!0,characterData:!0,subtree:!0})}q(()=>{r.disconnect(),a?.disconnect()})})}var nr=y("<div><div> Preview</div><div></div><div></div><div>"),ir=y("<img alt=Preview>"),ar=y("<div>No Image"),Ae=y("<div>"),lr=y("<div><strong>Missing tags for <!>:</strong><ul>"),sr=y("<li>"),Ee=[{network:"Facebook",tags:[{key:"og:title",prop:"title"},{key:"og:description",prop:"description"},{key:"og:image",prop:"image"},{key:"og:url",prop:"url"}],color:"#4267B2"},{network:"X/Twitter",tags:[{key:"twitter:title",prop:"title"},{key:"twitter:description",prop:"description"},{key:"twitter:image",prop:"image"},{key:"twitter:url",prop:"url"}],color:"#1DA1F2"},{network:"LinkedIn",tags:[{key:"og:title",prop:"title"},{key:"og:description",prop:"description"},{key:"og:image",prop:"image"},{key:"og:url",prop:"url"}],color:"#0077B5"},{network:"Discord",tags:[{key:"og:title",prop:"title"},{key:"og:description",prop:"description"},{key:"og:image",prop:"image"},{key:"og:url",prop:"url"}],color:"#5865F2"},{network:"Slack",tags:[{key:"og:title",prop:"title"},{key:"og:description",prop:"description"},{key:"og:image",prop:"image"},{key:"og:url",prop:"url"}],color:"#4A154B"},{network:"Mastodon",tags:[{key:"og:title",prop:"title"},{key:"og:description",prop:"description"},{key:"og:image",prop:"image"},{key:"og:url",prop:"url"}],color:"#6364FF"},{network:"Bluesky",tags:[{key:"og:title",prop:"title"},{key:"og:description",prop:"description"},{key:"og:image",prop:"image"},{key:"og:url",prop:"url"}],color:"#1185FE"}];function cr(t){const e=I();return(()=>{var l=nr(),i=l.firstChild,c=i.firstChild,s=i.nextSibling,r=s.nextSibling,a=r.nextSibling;return h(i,()=>t.network,c),h(l,(()=>{var o=D(()=>!!t.meta.image);return()=>o()?(()=>{var n=ir();return k(d=>{var g=t.meta.image,f=e().seoPreviewImage;return g!==d.e&&Q(n,"src",d.e=g),f!==d.t&&v(n,d.t=f),d},{e:void 0,t:void 0}),n})():(()=>{var n=ar();return n.style.setProperty("background","#222"),n.style.setProperty("color","#888"),n.style.setProperty("display","flex"),n.style.setProperty("align-items","center"),n.style.setProperty("justify-content","center"),n.style.setProperty("min-height","80px"),n.style.setProperty("width","100%"),k(()=>v(n,e().seoPreviewImage)),n})()})(),s),h(s,()=>t.meta.title||"No Title"),h(r,()=>t.meta.description||"No Description"),h(a,()=>t.meta.url||window.location.href),k(o=>{var n=e().seoPreviewCard,d=t.color,g=e().seoPreviewHeader,f=t.color,x=e().seoPreviewTitle,C=e().seoPreviewDesc,m=e().seoPreviewUrl;return n!==o.e&&v(l,o.e=n),d!==o.t&&((o.t=d)!=null?l.style.setProperty("border-color",d):l.style.removeProperty("border-color")),g!==o.a&&v(i,o.a=g),f!==o.o&&((o.o=f)!=null?i.style.setProperty("color",f):i.style.removeProperty("color")),x!==o.i&&v(s,o.i=x),C!==o.n&&v(r,o.n=C),m!==o.s&&v(a,o.s=m),o},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0}),l})()}var dr=()=>{const[t,e]=E(i()),l=I();function i(){const c=Array.from(document.head.querySelectorAll("meta")),s=[];for(const r of Ee){const a={},o=[];for(const n of r.tags){const d=c.find(g=>(n.key.includes("twitter:")?!1:g.getAttribute("property")===n.key)||g.getAttribute("name")===n.key);d&&d.getAttribute("content")?a[n.prop]=d.getAttribute("content")||void 0:o.push(n.key)}s.push({network:r.network,found:a,missing:o})}return s}return or(()=>{e(i())}),u(Pe,{withPadding:!0,get children(){return u(Y,{get children(){return[u(N,{get children(){return[u(R,{get children(){return u(Mt,{})}}),"Social previews"]}}),u(j,{children:"See how your current page will look when shared on popular social networks. The tool checks for essential meta tags and highlights any that are missing."}),(()=>{var c=Ae();return h(c,u(W,{get each(){return t()},children:(s,r)=>{const a=Ee[r()];return(()=>{var o=Ae();return h(o,u(cr,{get meta(){return s.found},get color(){return a.color},get network(){return a.network}}),null),h(o,(()=>{var n=D(()=>s.missing.length>0);return()=>n()?(()=>{var d=lr(),g=d.firstChild,f=g.firstChild,x=f.nextSibling;x.nextSibling;var C=g.nextSibling;return h(g,()=>a?.network,x),h(C,u(W,{get each(){return s.missing},children:m=>(()=>{var w=sr();return h(w,m),k(()=>v(w,l().seoMissingTag)),w})()})),k(m=>{var w=l().seoMissingTagsSection,A=l().seoMissingTagsList;return w!==m.e&&v(d,m.e=w),A!==m.t&&v(C,m.t=A),m},{e:void 0,t:void 0}),d})():null})(),null),o})()}})),k(()=>v(c,l().seoPreviewSection)),c})()]}})}})},Oe=[{name:"Plugins",id:"plugins",component:()=>u(rr,{}),icon:()=>u(Ct,{})},{name:"SEO",id:"seo",component:()=>u(dr,{}),icon:()=>u(At,{})},{name:"Settings",id:"settings",component:()=>u(Xt,{}),icon:()=>u(Et,{})}],gr=y("<div>"),ur=y("<button type=button>"),hr=y("<div><button type=button></button><button type=button>"),pr=t=>{const e=I(),{state:l,setState:i}=re(),c=le(),s=()=>{c().requestPipWindow(`width=${window.innerWidth},height=${l().height},top=${window.screen.height},left=${window.screenLeft}}`)},{hoverUtils:r}=de();return(()=>{var a=gr();return h(a,u(W,{each:Oe,children:o=>(()=>{var n=ur();return n.addEventListener("mouseleave",()=>{o.id==="plugins"&&r.leave()}),n.addEventListener("mouseenter",()=>{o.id==="plugins"&&r.enter()}),n.$$click=()=>i({activeTab:o.id}),h(n,()=>o.icon()),k(()=>v(n,B(e().tab,{active:l().activeTab===o.id}))),n})()}),null),h(a,(()=>{var o=D(()=>c().pipWindow!==null);return()=>o()?null:(()=>{var n=hr(),d=n.firstChild,g=d.nextSibling;return n.style.setProperty("margin-top","auto"),d.$$click=s,h(d,u(Pt,{})),g.$$click=()=>t.toggleOpen(),h(g,u(Dt,{})),k(f=>{var x=B(e().tab,"detach"),C=B(e().tab,"close");return x!==f.e&&v(d,f.e=x),C!==f.t&&v(g,f.t=C),f},{e:void 0,t:void 0}),n})()})(),null),k(()=>v(a,e().tabContainer)),a})()};$(["click"]);var fr=y("<div>"),vr=()=>{const{state:t}=re(),e=I(),l=F(()=>Oe.find(i=>i.id===t().activeTab)?.component||null);return(()=>{var i=fr();return h(i,()=>l()?.()),k(()=>v(i,e().tabContent)),i})()},mr=y("<div>");function yr(){const{settings:t}=T(),{setHeight:e}=Ie(),{persistOpen:l,setPersistOpen:i}=Nt(),[c,s]=E(),[r,a]=E(t().defaultOpen||l()),o=le();let n;const[d,g]=E(!1),f=()=>{if(o().pipWindow)return;const m=r();a(!m),i(!m)},x=(m,w)=>{if(w.button!==0||!m)return;g(!0);const A={originalHeight:m.getBoundingClientRect().height,pageY:w.pageY},S=V=>{const L=A.pageY-V.pageY,he=t().panelLocation==="bottom"?A.originalHeight+L:A.originalHeight-L;e(he),he<70?a(!1):a(!0)},z=()=>{g(!1),document.removeEventListener("mousemove",S),document.removeEventListener("mouseUp",z)};document.addEventListener("mousemove",S),document.addEventListener("mouseup",z)};M(()=>{if(r()){const m=c()?.parentElement?.style.paddingBottom,w=()=>{n&&c()?.parentElement&&s(A=>(A?.parentElement,A))};if(w(),typeof window<"u")return(o().pipWindow??window).addEventListener("resize",w),()=>{(o().pipWindow??window).removeEventListener("resize",w),c()?.parentElement&&typeof m=="string"&&s(A=>A)}}else c()?.parentElement&&s(m=>(m?.parentElement&&m.parentElement.removeAttribute("style"),m))}),M(()=>{window.addEventListener("keydown",m=>{m.key==="Escape"&&r()&&f()})}),jt(r),M(()=>{if(c()){const m=c(),w=getComputedStyle(m).fontSize;m?.style.setProperty("--tsrd-font-size",w)}}),M(()=>{const m=t().openHotkey.filter(S=>fe.includes(S)),w=t().openHotkey.filter(S=>!fe.includes(S)),A=Ke(m);for(const S of A){const z=[...S,...w];ot(z,()=>{f()})}}),M(()=>{const m=w=>{const A=w.shiftKey,S=w.ctrlKey||w.metaKey;if(!(!A||!S)&&w.target instanceof HTMLElement){const z=w.target.getAttribute("data-tsd-source");window.getSelection()?.removeAllRanges(),z&&(w.preventDefault(),w.stopPropagation(),fetch(`${location.origin}/__tsd/open-source?source=${encodeURIComponent(z)}`).catch(()=>{}))}};window.addEventListener("click",m),q(()=>{window.removeEventListener("click",m)})});const{theme:C}=ue();return u(nt,{get theme(){return C()},get children(){return u(Ye,{get mount(){return(o().pipWindow??window).document.body},get children(){var m=mr();return _(s,m),Q(m,"data-testid",se),h(m,u(ee,{get when(){return D(()=>o().pipWindow!==null)()?!0:D(()=>!!t().requireUrlFlag)()?window.location.search.includes(t().urlFlag):!0},get children(){return[u(qt,{isOpen:r,setIsOpen:f,get image(){return t().triggerImage}}),u(Gt,{isResizing:d,isOpen:r,get children(){return u(Vt,{ref:w=>n=w,handleDragStart:w=>x(n,w),get children(){return[u(pr,{toggleOpen:f}),u(vr,{})]}})}})]}})),m}})}})}export{yr as default};
