/*
API SRU Catalogue Général de la BNF

Interface : https://catalogue.bnf.fr/index.do 
Documentation : https://api.bnf.fr/fr/api-sru-catalogue-general 
Format Unimarc : https://www.transition-bibliographique.fr/unimarc/manuel-unimarc-format-bibliographique/ 
*/

import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
});

/**
 * Cherche un livre par titre ou ISBN sur l'API de la BNF
 * @param {string} query Paramètre de recherche
 * @returns Réponse de l'API de la BNF, parsé au format JSON
 */
export async function searchBookBNF(query: string) {
  const queryString = `(bib.title all "${query}" or bib.isbn all "${query}") and bib.language all "fre" and bib.doctype all "a" and (bib.recordtype all "mon" or bib.recordtype all "rec")`;

  const url =
    "https://catalogue.bnf.fr/api/SRU?" +
    new URLSearchParams({
      version: "1.2",
      operation: "searchRetrieve",
      query: queryString,
      maximumRecords: "10",
    }).toString();

  console.log(">>> [SEARCH] BNF : ", url); // à supprimer
  try {
    const response = await fetch(url);
    const xml = await response.text();

    return parser.parse(xml);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Cherche l'ensemble des livres correspondants un titre et à une liste d'auteurs précises, dans l'objectif de rassembler les éditions
 * @param {string} title Titre de l'oeuvre recherchée
 * @param {string[]} authors Liste des auteurs du l'oeuvre recherchée
 * @returns Réponse de l'API de la BNF, parsé au format JSON
 */
export async function searchEditionsBNF(title: string, authors: string[]) {
  var queryAuthor = "";
  for (const author of authors) {
    queryAuthor += `and bib.author all "${author}"`;
  }

  const queryString = `(bib.title all "${title}" ${queryAuthor}) and bib.language all "fre" and bib.doctype all "a" and (bib.recordtype all "mon" or bib.recordtype all "rec")`;

  const url =
    "https://catalogue.bnf.fr/api/SRU?" +
    new URLSearchParams({
      version: "1.2",
      operation: "searchRetrieve",
      query: queryString,
      maximumRecords: "20",
    }).toString();

  console.log(">>> [EDITIONS] BNF : ", url); // à supprimer
  try {
    const response = await fetch(url);
    const xml = await response.text();

    return parser.parse(xml);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Retourne l'ensemble des champs correspondants au tag souhaité pour le livre donné
 * @param {any} record Livre
 * @param {string} tag Tag souhaité
 * @returns {any[]} Tableau des champs
 */
export function getFields(record: any, tag: string) {
  return (
    record["srw:recordData"]["mxc:record"]["mxc:datafield"]?.filter(
      (field: any) => field["@_tag"] === tag,
    ) || []
  );
}

/**
 * Retourne le premier champ correspondant au tag souhaité pour le livre donné
 * @param {any} record Livre
 * @param {string} tag Tag souhaité
 * @returns {any} Champ
 */
export function getField(record: any, tag: string) {
  return record["srw:recordData"]["mxc:record"]["mxc:datafield"]?.find(
    (field: any) => field["@_tag"] === tag,
  );
}

/**
 * Retourne le sous-champ correspondant au code souhaité pour le champ donné
 * @param {any} field Champ
 * @param {string} code Code
 * @returns {string} Valeur du sous-champ
 */
export function getSubfield(field: any, code: string) {
  const subfields = Array.isArray(field?.["mxc:subfield"])
    ? field["mxc:subfield"]
    : [field?.["mxc:subfield"]];
  return subfields.find((sf: any) => sf?.["@_code"] === code)?.["#text"];
}
