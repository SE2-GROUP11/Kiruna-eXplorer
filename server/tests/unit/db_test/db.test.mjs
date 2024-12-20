import {describe} from "@jest/globals";

import DocumentType from "../../../src/components/documentType.mjs";
import {addDocument, editDocument} from "../../../src/daos/documentDAO.mjs";
import Document from "../../../src/components/document.mjs";
import db from "../../../src/db/db.mjs";

jest.mock('../../../src/db/db.mjs')

afterEach(() => {
    jest.clearAllMocks()
})

describe('database queries', () => {

    describe('addDocument', () => {

        test("addDocument query", async () => {
            jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
                callback(null, document)
                return {}
            })
            const document = new Document();
            document.createFromObject({
                title: 'title',
                description: 'description',
                stakeholders: 'stakeholders',
                scale: 'scale',
                issuanceDate: 'issuanceDate',
                type: DocumentType.DESIGN_DOCUMENT,
                language: 'language',
                coordinates: '[1.1, 2.2]',
                connectionIds: []
            })
            const result = await addDocument(
                document.id,
                document.title,
                document.description,
                document.stakeholders,
                document.scale,
                document.issuanceDate,
                document.type,
                document.language,
                document.coordinates,
                document.connections
            )
            expect(result).toBeUndefined()
        });


    });

    describe('editDocument', () => {

        test("editDocument query", async () => {
            const document = {
                id: '1',
                title: 'updated title',
                description: 'updated description',
                stakeholders: 'updated stakeholders',
                scale: 'updated scale',
                issuanceDate: 'updated issuanceDate',
                type: 'DESIGN_DOCUMENT',
                language: 'updated language',
                coordinates: [1.1, 2.2],
                connections: []
            };

            jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
                callback(null);
                return {};
            });

            const result = await editDocument(
                document.id,
                document.title,
                document.description,
                document.stakeholders,
                document.scale,
                document.issuanceDate,
                document.type,
                document.language,
                document.coordinates,
                document.connections
            );

            expect(result).toBeUndefined();
            
        });

    });


})