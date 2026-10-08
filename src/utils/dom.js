// 셀렉터 단축 함수 — qsa는 NodeList 대신 배열을 반환해 map/forEach/findIndex를 바로 쓸 수 있다
export const qs = (selector, ctx = document) => ctx.querySelector(selector);
export const qsa = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];
